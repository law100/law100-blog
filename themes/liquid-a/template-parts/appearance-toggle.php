<?php // Shared by the Hero and fixed header; no duplicate IDs.
if ( is_page( 'drive' ) ) { return; }
?>
<div class="appearance-control">
	<button class="appearance-toggle" type="button" aria-label="当前：日间；点击切换为夜间">
		<?php foreach ( array( 'light', 'dark' ) as $mode ) : ?>
			<span class="appearance-icon appearance-icon--<?php echo esc_attr( $mode ); ?>" aria-hidden="true"><?php require LIQUIDGLASS_THEME_DIR . '/assets/icons/appearance-' . $mode . '.svg'; ?></span>
		<?php endforeach; ?>
	</button>
	<span class="appearance-tip" aria-hidden="true">当前：日间；点击切换为夜间</span>
</div>
