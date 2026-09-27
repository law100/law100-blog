<?php
/** Read-only: php tests/reading-smoke.php /var/www/law100 [/path/to/candidate/theme] */
if ( PHP_SAPI !== 'cli' ) { exit; }
if ( isset( $argv[2] ) ) {
	foreach ( array( 'template_directory', 'stylesheet_directory' ) as $hook ) {
		$GLOBALS['wp_filter'][$hook][10][] = array( 'function' => function() use ( $argv ) { return $argv[2]; }, 'accepted_args' => 1 );
	}
}
require rtrim( $argv[1], '/' ) . '/wp-load.php';
$source = '<div id="reading-section-1"></div><h2>重复标题</h2><h3>重复标题</h3><h2 id="existing">保留标题</h2>';
$result = liquidglass_reading_content( $source );
foreach ( array( 'reading-section-2', 'reading-section-3', 'existing' ) as $id ) {
	if ( substr_count( $result['content'], 'id="' . $id . '"' ) !== 1 ) { throw new Exception( 'Heading ID regression: ' . $id ); }
}
if ( substr_count( $result['toc'], '<a ' ) !== 3 || strpos( $result['toc'], '<details class="reading-toc">' ) !== 0 ) { throw new Exception( 'TOC shape regression' ); }
if ( liquidglass_reading_content( '<h2>One</h2><h3>Two</h3>' )['toc'] !== '' ) { throw new Exception( 'TOC threshold regression' ); }
$plain = '<p>Plain &amp; unchanged</p><pre><code>&lt;h2&gt;Code&lt;/h2&gt;</code></pre>';
if ( liquidglass_reading_content( $plain )['content'] !== $plain ) { throw new Exception( 'Unrelated content changed' ); }
echo "Reading TOC smoke checks PASS (no database writes)\n";
