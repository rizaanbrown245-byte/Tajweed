package com.tajweedai.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {
    private static final int RECORD_AUDIO_PERMISSION_REQUEST_CODE = 2001;
    private PermissionRequest pendingPermissionRequest;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize high-performance hardware-accelerated WebView
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        final androidx.webkit.WebViewAssetLoader assetLoader = new androidx.webkit.WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new androidx.webkit.WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new androidx.webkit.WebViewClientCompat() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Direct fallback to file scheme if asset loader cannot resolve
                if (failingUrl != null && failingUrl.contains("appassets.androidplatform.net")) {
                    view.loadUrl("file:///android_asset/public/index.html");
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // Grant audio capture permission inside Android WebView
                String[] resources = request.getResources();
                for (String resource : resources) {
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                                == PackageManager.PERMISSION_GRANTED) {
                            request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                        } else {
                            pendingPermissionRequest = request;
                            ActivityCompat.requestPermissions(
                                    MainActivity.this,
                                    new String[]{Manifest.permission.RECORD_AUDIO},
                                    RECORD_AUDIO_PERMISSION_REQUEST_CODE
                            );
                        }
                        return;
                    }
                }
                request.deny();
            }
        });

        // Load bundled assets over secure Android origin
        webView.loadUrl("https://appassets.androidplatform.net/assets/public/index.html");
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == RECORD_AUDIO_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingPermissionRequest != null) {
                    pendingPermissionRequest.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    pendingPermissionRequest = null;
                }
            } else {
                if (pendingPermissionRequest != null) {
                    pendingPermissionRequest.deny();
                    pendingPermissionRequest = null;
                }
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
