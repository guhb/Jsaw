<?php
$src = '..\build';
$dst = '..\app\assets\www';

function recurse_copy($src, $dst, $isWin) {
    $slash = $isWin ? '\\' : '/';
    $dir = opendir($src);
    @mkdir($dst);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . $slash . $file)) {
                recurse_copy($src . $slash . $file, $dst . $slash . $file, $isWin);
            } else {
                echo 'copy ' . $src . $slash . $file . ' to ' . $dst . $slash . $file . "\n";
                copy($src . $slash . $file, $dst . $slash . $file);
            }
        }
    }
    closedir($dir);
}

if (count($_SERVER["argv"]) > 1) {
    $doCopy = false;
    if (in_array("copy", $_SERVER["argv"])) {
        $doCopy = true;
    } elseif (is_dir($_SERVER["argv"][1])) {
        $dst = $_SERVER["argv"][1];
        $doCopy = true;
    } else {
        $doCopy = false;
        echo $_SERVER["argv"][1] . " is not a legal dir.\n";
    }

    if ($doCopy) {
        echo "copy generated files from [ " . $src . " ] to [ " .$dst . " ]\n";
        recurse_copy($src, $dst, true);
        echo "copy finished. :) \n";
    }
}
?>