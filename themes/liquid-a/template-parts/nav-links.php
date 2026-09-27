<?php
/**
 * 模板部件：导航链接（首页按钮 + 菜单/页面列表）
 * 被 hero.php 和 header.php 共用
 */
?>
<?php if ( has_nav_menu( 'primary' ) ) :
	wp_nav_menu( array(
		'theme_location' => 'primary',
		'items_wrap'     => '%3$s',
		'container'      => false,
		'fallback_cb'    => false,
	) );
else :
	// 没有绑定主菜单时使用与正式菜单一致的三项回退导航。
	$articles_page = get_page_by_path( 'articles', OBJECT, 'page' );
	$about_page    = get_page_by_path( 'about', OBJECT, 'page' );
	?>
	<li class="menu-item"><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( '首页', 'liquidglass' ); ?></a></li>
	<li class="menu-item"><a href="<?php echo esc_url( $articles_page ? get_permalink( $articles_page->ID ) : home_url( '/articles/' ) ); ?>"><?php esc_html_e( '文章', 'liquidglass' ); ?></a></li>
	<li class="menu-item"><a href="<?php echo esc_url( $about_page ? get_permalink( $about_page->ID ) : home_url( '/about/' ) ); ?>"><?php esc_html_e( '关于', 'liquidglass' ); ?></a></li>
	<?php
endif;
