import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('android/app/src/main/java/my/safamarwah/companion/MainActivity.java');
if (!fs.existsSync(file)) throw new Error('Run npx cap add android first: ' + file);

// Bundle the user's portrait poster as a native drawable, available without internet.
const splashSource = path.resolve('assets/splash-screen.png');
if (!fs.existsSync(splashSource)) throw new Error('Missing native splash poster: ' + splashSource);
const splashDestDir = path.resolve('android/app/src/main/res/drawable-nodpi');
fs.mkdirSync(splashDestDir, { recursive: true });
fs.copyFileSync(splashSource, path.join(splashDestDir, 'safamarwah_splash.png'));

const source = `package my.safamarwah.companion;

import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.ImageView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
 private ImageView splashPoster;
 private final Handler splashHandler = new Handler(Looper.getMainLooper());

 @Override public void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  Window w = getWindow();
  WindowCompat.setDecorFitsSystemWindows(w, false);
  w.setStatusBarColor(Color.TRANSPARENT);
  w.setNavigationBarColor(Color.BLACK);
  WindowInsetsControllerCompat c = WindowCompat.getInsetsController(w, w.getDecorView());
  c.setAppearanceLightStatusBars(false);
  c.setAppearanceLightNavigationBars(false);

  // Show the bundled portrait poster only in the native APK, above the WebView.
  FrameLayout decor = (FrameLayout) w.getDecorView();
  splashPoster = new ImageView(this);
  splashPoster.setImageResource(R.drawable.safamarwah_splash);
  splashPoster.setScaleType(ImageView.ScaleType.CENTER_CROP);
  splashPoster.setBackgroundColor(Color.rgb(0, 43, 35));
  FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
    FrameLayout.LayoutParams.MATCH_PARENT,
    FrameLayout.LayoutParams.MATCH_PARENT,
    Gravity.CENTER
  );
  decor.addView(splashPoster, params);
  splashPoster.bringToFront();
  splashHandler.postDelayed(() -> dismissSplash(), 1500);
 }

 private void dismissSplash() {
  if (splashPoster == null) return;
  final ImageView poster = splashPoster;
  splashPoster = null;
  poster.animate().alpha(0f).setDuration(300).withEndAction(() -> {
   if (poster.getParent() instanceof FrameLayout) {
    ((FrameLayout) poster.getParent()).removeView(poster);
   }
  }).start();
 }

 @Override protected void onDestroy() {
  splashHandler.removeCallbacksAndMessages(null);
  if (splashPoster != null && splashPoster.getParent() instanceof FrameLayout) {
   ((FrameLayout) splashPoster.getParent()).removeView(splashPoster);
   splashPoster = null;
  }
  super.onDestroy();
 }
}
`;
fs.writeFileSync(file, source);
console.log('Configured native Android splash poster and transparent status bar.');
