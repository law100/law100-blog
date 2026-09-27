<?php
/**
 * 主题页脚模板
 */
?>
		</div><!-- #content -->

	<footer id="colophon" class="site-footer">
		<div class="footer-inner container">
			<nav class="footer-navigation" aria-label="<?php esc_attr_e( '页脚导航', 'liquidglass' ); ?>">
				<?php
				wp_nav_menu( array(
					'theme_location' => 'footer',
					'menu_class'     => 'footer-menu',
					'container'      => false,
					'depth'          => 1,
					'fallback_cb'    => false,
				) );
				?>
			</nav>
			<div class="site-info">
				<span class="copyright">&copy; <?php echo esc_html( wp_date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?></span>
			</div>
		</div>
	</footer><!-- #colophon -->

</div><!-- #page -->

<div id="back-to-top-root" class="liquid-glass-root liquid-glass-root--back" data-liquid-glass="button" data-liquid-glass-variant="back">
	<button id="back-to-top" class="back-to-top liquid-glass-fallback" aria-label="<?php esc_attr_e( '回到顶部', 'liquidglass' ); ?>">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="18 15 12 9 6 15"/>
		</svg>
	</button>
</div>

<?php wp_footer(); ?>
</body>
</html>
