package city.silver.unending;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.pm.PackageInfoCompat;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.io.ByteArrayInputStream;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Live Pages shell and the bundled Play shell share this activity.
 * Remote content may stay in the WebView only for the Silver
 * City path, or for the bundled localhost copy used when that load fails.
 * Capacitor's general plugin bridge is removed: the Pages document must not
 * call Http, Cookies, SystemBars, or any other plugin. A share-only listener
 * is put back so @capacitor/share can open the system sheet. SilverCityShell
 * .getVersionCode() stays, a read-only int the update card compares to
 * shell.json. The download link is a fixed https URL in the web bundle; this
 * activity sends that navigation to the browser.
 */
public class MainActivity extends BridgeActivity {
    static final String PAGES_HOST = "cphillippe.github.io";
    static final String PAGES_PREFIX = "/Silver-dollar-city";
    /** Fixed share target. A url from the page is ignored. */
    static final String PAGES_SHARE_URL = "https://cphillippe.github.io/Silver-dollar-city/";
    static final int SHARE_MESSAGE_MAX = 16384;
    static final int SHARE_TEXT_MAX = 2000;
    static final int SHARE_TITLE_MAX = 200;

    private ActivityResultLauncher<Intent> shareLauncher;
    private PendingShare pendingShare;
    private boolean shareListenerReady;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        shareLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            this::finishShare
        );
        super.onCreate(savedInstanceState);
    }

    @SuppressLint("AddJavascriptInterface")
    @Override
    protected void load() {
        super.load();
        lockWebView();
    }

    @Override
    public void onResume() {
        super.onResume();
        lockWebView();
    }

    @SuppressLint("AddJavascriptInterface")
    private void lockWebView() {
        Bridge bridge = getBridge();
        if (bridge == null || bridge.getWebView() == null) return;
        WebView webView = bridge.getWebView();
        stripCapacitorBridges(webView);
        allowShareBridge(webView);
        webView.addJavascriptInterface(new ShellBridge(readVersionCode()), "SilverCityShell");
        bridge.setWebViewClient(new PagesOnlyClient(bridge));
    }

    /**
     * After the stock bridge is gone, accept only Share.share and Share.canShare
     * from the Pages origin (and the bundled localhost error page). Every other
     * plugin id is rejected. The listener is added once; resume does not add it again.
     * WebViews without WEB_MESSAGE_LISTENER never get a share bridge.
     */
    private void allowShareBridge(WebView webView) {
        if (shareListenerReady) return;
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) return;
        Set<String> origins = new HashSet<>();
        origins.add("https://" + PAGES_HOST);
        origins.add("https://localhost");
        origins.add("https://127.0.0.1");
        try {
            WebViewCompat.addWebMessageListener(webView, "androidBridge", origins, this::onShareBridgeMessage);
        } catch (RuntimeException ignored) {
            return;
        }
        shareListenerReady = true;
        // Removing the stock listener replaces window.androidBridge. The document-start
        // script already ran, so this rebinds onmessage or launch replies never resolve.
        webView.evaluateJavascript(
            "(function(){var b=window.androidBridge;var c=window.Capacitor;" +
                "if(!b||!c||typeof c.fromNative!=='function')return;" +
                "b.onmessage=function(ev){try{var raw=ev&&ev.data;var d=typeof raw==='string'?JSON.parse(raw):raw;c.fromNative(d);}catch(e){}};})();",
            null
        );
    }

    private void onShareBridgeMessage(
        WebView view,
        WebMessageCompat message,
        Uri sourceOrigin,
        boolean isMainFrame,
        JavaScriptReplyProxy replyProxy
    ) {
        if (!isMainFrame || !shareOriginAllowed(sourceOrigin) || replyProxy == null) return;
        final String raw = message == null ? null : message.getData();
        runOnUiThread(() -> handleShareMessage(raw, replyProxy));
    }

    private void handleShareMessage(String raw, JavaScriptReplyProxy replyProxy) {
        if (raw != null && raw.length() > SHARE_MESSAGE_MAX) {
            new PendingShare(callbackIdPrefix(raw), "Share", "share", replyProxy).fail("share message too large");
            return;
        }
        JSONObject post;
        try {
            post = raw == null ? new JSONObject() : new JSONObject(raw);
        } catch (JSONException ex) {
            return;
        }
        String type = jsonString(post, "type");
        if ("js.error".equals(type)) return;
        String callbackId = jsonString(post, "callbackId");
        String pluginId = jsonString(post, "pluginId");
        String methodName = jsonString(post, "methodName");
        PendingShare call = new PendingShare(callbackId, pluginId == null ? "" : pluginId, methodName == null ? "" : methodName, replyProxy);
        if ("cordova".equals(type) || !"Share".equals(pluginId)) {
            call.fail("plugin not available");
            return;
        }
        if ("canShare".equals(methodName)) {
            call.ok(jsonObject("value", true));
            return;
        }
        if (!"share".equals(methodName)) {
            call.fail("plugin not available");
            return;
        }
        if (pendingShare != null) {
            call.fail("Can't share while sharing is in progress");
            return;
        }
        JSONObject options = post.optJSONObject("options");
        if (options == null) options = new JSONObject();
        String title = jsonString(options, "title");
        String text = jsonString(options, "text");
        String dialogTitle = jsonString(options, "dialogTitle");
        // A url from the page is ignored. The sheet uses PAGES_SHARE_URL.
        if (options.has("files") && !options.isNull("files")) {
            call.fail("files are not shared from the shell");
            return;
        }
        if (text != null && text.length() > SHARE_TEXT_MAX) {
            call.fail("share text too long");
            return;
        }
        if (title != null && title.length() > SHARE_TITLE_MAX) {
            call.fail("share title too long");
            return;
        }
        if (dialogTitle != null && dialogTitle.length() > SHARE_TITLE_MAX) {
            call.fail("share title too long");
            return;
        }
        String body = text;
        if (body == null) body = PAGES_SHARE_URL;
        else if (!body.contains(PAGES_SHARE_URL)) body = body + "\n" + PAGES_SHARE_URL;
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("text/plain");
        send.putExtra(Intent.EXTRA_TEXT, body);
        if (title != null) send.putExtra(Intent.EXTRA_SUBJECT, title);
        String chooserTitle = dialogTitle != null ? dialogTitle : (title != null ? title : "Share");
        Intent chooser = Intent.createChooser(send, chooserTitle);
        if (shareLauncher == null) {
            call.fail("Share failed");
            return;
        }
        pendingShare = call;
        try {
            shareLauncher.launch(chooser);
        } catch (RuntimeException ex) {
            pendingShare = null;
            call.fail("Share failed");
            return;
        }
        // The page must hear back at launch. Waiting for the sheet to close lets the
        // 3s timer open a second share. Close and cancel send nothing.
        call.ok(jsonObject("activityType", ""));
    }

    /** The sheet is already acked. Closing it, including a cancel, sends nothing. */
    private void finishShare(ActivityResult result) {
        pendingShare = null;
    }

    private static boolean shareOriginAllowed(Uri origin) {
        if (origin == null || !"https".equalsIgnoreCase(origin.getScheme())) return false;
        String host = origin.getHost();
        if (host == null) return false;
        return PAGES_HOST.equalsIgnoreCase(host)
            || "localhost".equalsIgnoreCase(host)
            || "127.0.0.1".equals(host);
    }

    /** Callback id from the front of an oversized payload. The rest is not parsed. */
    private static String callbackIdPrefix(String raw) {
        int end = Math.min(raw.length(), 512);
        String head = raw.substring(0, end);
        String key = "\"callbackId\"";
        int at = head.indexOf(key);
        if (at < 0) return null;
        int colon = head.indexOf(':', at + key.length());
        if (colon < 0) return null;
        int open = head.indexOf('"', colon + 1);
        if (open < 0 || open + 1 >= head.length()) return null;
        int close = head.indexOf('"', open + 1);
        if (close < 0) return null;
        String id = head.substring(open + 1, close);
        return id.isEmpty() ? null : id;
    }

    private static String jsonString(JSONObject object, String key) {
        if (object == null || !object.has(key) || object.isNull(key)) return null;
        Object raw = object.opt(key);
        if (!(raw instanceof String)) return null;
        String value = (String) raw;
        return value.isEmpty() ? null : value;
    }

    private static JSONObject jsonObject(String key, Object value) {
        JSONObject object = new JSONObject();
        try {
            object.put(key, value);
        } catch (JSONException ignored) {
            // A one-field reply that failed to encode still resolves as empty.
        }
        return object;
    }

    private static final class PendingShare {
        final String callbackId;
        final String pluginId;
        final String methodName;
        final JavaScriptReplyProxy replyProxy;

        PendingShare(String callbackId, String pluginId, String methodName, JavaScriptReplyProxy replyProxy) {
            this.callbackId = callbackId;
            this.pluginId = pluginId;
            this.methodName = methodName;
            this.replyProxy = replyProxy;
        }

        void ok(JSONObject data) {
            reply(true, data, null);
        }

        void fail(String message) {
            reply(false, null, message);
        }

        private void reply(boolean success, JSONObject data, String message) {
            if (callbackId == null || "-1".equals(callbackId)) return;
            try {
                JSONObject payload = new JSONObject();
                payload.put("save", false);
                payload.put("callbackId", callbackId);
                payload.put("pluginId", pluginId);
                payload.put("methodName", methodName);
                payload.put("success", success);
                if (success) {
                    if (data != null) payload.put("data", data);
                } else {
                    JSONObject error = new JSONObject();
                    error.put("message", message == null ? "Share failed" : message);
                    payload.put("error", error);
                }
                replyProxy.postMessage(payload.toString());
            } catch (RuntimeException | JSONException ignored) {
                // The page navigated away before the sheet closed.
            }
        }
    }

    /**
     * Capacitor registers androidBridge as a WebMessageListener when the
     * WebView supports it, and as a JavascriptInterface otherwise. Both have
     * to go. Http, Cookies, and SystemBars are the other plugin interfaces
     * this Capacitor version adds. Plugins register them during load(), which
     * has already returned, and again is harmless if a later resume re-adds them.
     */
    private void stripCapacitorBridges(WebView webView) {
        if (!shareListenerReady) {
            try {
                WebViewCompat.removeWebMessageListener(webView, "androidBridge");
            } catch (RuntimeException ignored) {
                // Listener was not registered on this WebView.
            }
        }
        webView.removeJavascriptInterface("androidBridge");
        webView.removeJavascriptInterface("CapacitorHttpAndroidInterface");
        webView.removeJavascriptInterface("CapacitorCookiesAndroidInterface");
        webView.removeJavascriptInterface("CapacitorSystemBarsAndroidInterface");
    }

    /**
     * https://cphillippe.github.io/Silver-dollar-city and paths under it, plus
     * the local https://localhost (and 127.0.0.1) asset server for errorPath.
     */
    static boolean staysInWebView(Uri uri) {
        if (uri == null) return false;
        if (!"https".equalsIgnoreCase(uri.getScheme())) return false;
        int port = uri.getPort();
        if (port != -1 && port != 443) return false;
        String host = uri.getHost();
        if (host == null) return false;
        if ("localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host)) return true;
        if (!PAGES_HOST.equalsIgnoreCase(host)) return false;
        String path = uri.getPath();
        if (path == null) return false;
        if (path.indexOf('\\') >= 0 || path.contains("..")) return false;
        return PAGES_PREFIX.equals(path) || path.startsWith(PAGES_PREFIX + "/");
    }

    private int readVersionCode() {
        try {
            PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
            long code = PackageInfoCompat.getLongVersionCode(info);
            if (code > Integer.MAX_VALUE) return Integer.MAX_VALUE;
            return (int) code;
        } catch (PackageManager.NameNotFoundException ex) {
            return 0;
        }
    }

    public static final class ShellBridge {
        private final int versionCode;

        ShellBridge(int versionCode) {
            this.versionCode = versionCode;
        }

        @JavascriptInterface
        public int getVersionCode() {
            return versionCode;
        }
    }

    /** Unused Capacitor paths. Refused for the live origin and the Play bundle. */
    static boolean blocksCapacitorPrivatePath(String path) {
        if (path == null) return false;
        return path.startsWith("/_capacitor_file_")
            || path.startsWith("/_capacitor_content_")
            || path.startsWith("/_capacitor_http_interceptor_");
    }

    private static WebResourceResponse forbidden() {
        return new WebResourceResponse(
            "text/plain",
            "utf-8",
            403,
            "Forbidden",
            Collections.emptyMap(),
            new ByteArrayInputStream(new byte[0])
        );
    }

    private final class PagesOnlyClient extends BridgeWebViewClient {
        PagesOnlyClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request == null ? null : request.getUrl();
            String path = uri == null ? null : uri.getPath();
            if (blocksCapacitorPrivatePath(path)) return forbidden();
            return super.shouldInterceptRequest(view, request);
        }

        @Override
        @SuppressWarnings("deprecation")
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            Uri uri = url == null ? null : Uri.parse(url);
            String path = uri == null ? null : uri.getPath();
            if (blocksCapacitorPrivatePath(path)) return forbidden();
            return super.shouldInterceptRequest(view, url);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request == null ? null : request.getUrl();
            boolean mainFrame = request != null && request.isForMainFrame();
            return route(uri, mainFrame);
        }

        @Override
        @SuppressWarnings("deprecation")
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return route(url == null ? null : Uri.parse(url), true);
        }

        /**
         * @return false to let the WebView load the URL. true to keep it out.
         * Other https main-frame navigations open in the external browser.
         * Subframes and non-https URLs are blocked.
         */
        private boolean route(Uri uri, boolean mainFrame) {
            if (staysInWebView(uri)) return false;
            if (mainFrame && uri != null && "https".equalsIgnoreCase(uri.getScheme())) {
                openExternal(uri);
            }
            return true;
        }

        private void openExternal(Uri uri) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException ignored) {
                // Nothing on the device accepted the link. Leave the town page up.
            }
        }
    }
}
