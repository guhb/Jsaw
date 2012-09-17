<?php
$jsFiles = ' --js Resource.js';

$preLoadFiles = array(
    'Classes/Config/Theme.js',
    'Classes/Config/global.js',
    'Classes/Actor/ToolObjects.js',
    'Classes/Actor/PropObjects.js',
    'Classes/Actor/MineObject.js',
    'Classes/Config/ObjectType.js',
    'Classes/Config/Level.js',
    'Classes/Config/Game.js'
    );

foreach ($preLoadFiles as $file) {
    $jsFiles .= " --js " . $file;
}

$d = new RecDir( 'Classes/', false );
while ( false !== ( $entry = $d -> read() ) ) {
    if( '.js' === substr( $entry, -3 ) && !in_array($entry, $preLoadFiles)) {
        $jsFiles .= ' --js "' . $entry . '"';
    }
}
$d -> close();

echo $jsFiles . "\n";

exec( 'java -jar tools/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS ' . $jsFiles . ' --js_output_file ' . '../build/app.js' );
copy( 'Cocos2d-html5-canvasmenu-min.js', '../build/Cocos2d-html5-canvasmenu-min.js');
copy( 'index.html', '../build/index.html');

$cocosedLoader = 'cocos2d.js';
if (!file_exists($cocosedLoader)) {
    echo $cocosedLoader . 'dose not exist.';
} else {
    $tempStr = file_get_contents($cocosedLoader);
    $jsFilesPos = strPos($tempStr, 'cc.loadjs(');
    $tempStr = substr($tempStr, 0, $jsFilesPos);
    $tempStr .= "cc.loadjs('Cocos2d-html5-canvasmenu-min.js');\n";
    $tempStr .= "cc.loadjs('app.js')\n";
    touch ('../build/cocos2d.js');
    file_put_contents('../build/cocos2d.js', $tempStr);
}

$ResourceDir = "Resources/";
$d = new RecDir( $ResourceDir, false );
while ( false !== ( $entry = $d -> read() ) ) {
    $dirname = dirname($entry);
    $new_dir = str_replace('Resources', '../build/Resources/', $dirname);
    if(!file_exists($new_dir)) {
        mkdir($new_dir);
    }
    $filename = basename($entry);
    copy($entry, $new_dir . '/' . $filename);
}
$d -> close();

?>