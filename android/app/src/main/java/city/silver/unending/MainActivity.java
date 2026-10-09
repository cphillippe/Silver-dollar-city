package city.silver.unending;

import android.annotation.SuppressLint;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.content.pm.PackageInfoCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @SuppressLint("AddJavascriptInterface")
    @Override
    protected void load() {
        super.load();
        WebView webView = getBridge().getWebView();
        // Same-thread, before the queued load runs. Exposes the installed
        // versionCode only. The page decides whether to offer the known APK URL.
        webView.addJavascriptInterface(new ShellBridge(readVersionCode()), "SilverCityShell");
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
}
