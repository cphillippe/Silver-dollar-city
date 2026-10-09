package city.silver.unending;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import androidx.core.content.pm.PackageInfoCompat;
import androidx.webkit.WebViewCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

/**
 * Live Pages shell. Remote content may stay in the WebView only for the Silver
 * City path, or for the bundled localhost copy used when that load fails.
 * Capacitor's plugin bridge is removed: the Pages document must not call
 * native plugins. SilverCityShell.getVersionCode() stays, a read-only int the
 * update card compares to shell.json. The download link is a fixed https URL
 * in the web bundle; this activity sends that navigation to the browser.
 */
public class MainActivity extends BridgeActivity {
    static final String PAGES_HOST = "cphillippe.github.io";
    static final String PAGES_PREFIX = "/Silver-dollar-city";

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
        webView.addJavascriptInterface(new ShellBridge(readVersionCode()), "SilverCityShell");
        webView.setWebViewClient(new PagesOnlyClient(bridge));
    }

    /**
     * Capacitor registers androidBridge as a WebMessageListener when the
     * WebView supports it, and as a JavascriptInterface otherwise. Both have
     * to go. Http, Cookies, and SystemBars are the other plugin interfaces
     * this Capacitor version adds. Plugins register them during load(), which
     * has already returned, and again is harmless if a later resume re-adds them.
     */
    private static void stripCapacitorBridges(WebView webView) {
        try {
            WebViewCompat.removeWebMessageListener(webView, "androidBridge");
        } catch (RuntimeException ignored) {
            // Listener was not registered on this WebView.
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

    private final class PagesOnlyClient extends BridgeWebViewClient {
        PagesOnlyClient(Bridge bridge) {
            super(bridge);
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
