import fs from 'node:fs';
import path from 'node:path';
const file=path.resolve('android/app/src/main/java/my/safamarwah/companion/MainActivity.java');
if(!fs.existsSync(file))throw new Error('Run npx cap add android first: '+file);
const source=`package my.safamarwah.companion;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
 @Override public void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  Window w=getWindow();
  WindowCompat.setDecorFitsSystemWindows(w,false);
  w.setStatusBarColor(Color.TRANSPARENT);
  w.setNavigationBarColor(Color.BLACK);
  WindowInsetsControllerCompat c=WindowCompat.getInsetsController(w,w.getDecorView());
  c.setAppearanceLightStatusBars(false);
  c.setAppearanceLightNavigationBars(false);
 }
}
`;
fs.writeFileSync(file,source);
console.log('Patched native Android MainActivity for transparent status bar.');
