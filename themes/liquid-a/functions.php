<?php
/**
 * LiquidGlass 主题函数文件
 * 包含所有主题设置、自定义器、资源加载等功能
 */

// 定义主题常量
define( 'LIQUIDGLASS_THEME_DIR', get_template_directory() );
define( 'LIQUIDGLASS_THEME_URI', get_template_directory_uri() );

/**
 * 主题初始化设置
 */
function liquidglass_setup() {
	// 支持多语言
	load_theme_textdomain( 'liquidglass', LIQUIDGLASS_THEME_DIR . '/languages' );

	// 添加默认帖子格式支持
	add_theme_support( 'post-formats', array( 'aside', 'gallery', 'link', 'image', 'quote', 'status', 'video', 'audio', 'chat' ) );

	// 添加自定义头部支持（如logo）
	add_theme_support( 'custom-logo', array(
		'height'      => 80,
		'width'       => 200,
		'flex-height' => true,
		'flex-width'  => true,
	) );

	// 文章缩略图支持
	add_theme_support( 'post-thumbnails' );
	set_post_thumbnail_size( 1200, 630, true ); // 大图尺寸，用于社交分享

	// 标题标签支持（让wp_head()输出title标签）
	add_theme_support( 'title-tag' );

	// HTML5支持
	add_theme_support( 'html5', array(
		'comment-list', 'comment-form', 'search-form', 'gallery', 'caption', 'style', 'script'
	) );

	// 现代编辑器和嵌入内容支持
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );

	// 注册导航菜单位置
	register_nav_menus( array(
		'primary' => esc_html__( '主菜单', 'liquidglass' ),
		'footer'  => esc_html__( '页脚菜单', 'liquidglass' ),
	) );

	// 注册侧边栏
	register_sidebar( array(
		'name'          => esc_html__( '侧边栏', 'liquidglass' ),
		'id'            => 'sidebar-1',
		'description'   => esc_html__( '显示在文章页面侧边的通用侧边栏', 'liquidglass' ),
		'before_widget' => '<section id="%1$s" class="widget glass-card %2$s">',
		'after_widget'  => '</section>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	) );

	// WooCommerce 支持（无需完全实现，但保留钩子）
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
}
add_action( 'after_setup_theme', 'liquidglass_setup' );

/**
 * 加载主题资源（CSS/JS）
 */
function liquidglass_asset_version( $relative_path ) {
	$path = trailingslashit( LIQUIDGLASS_THEME_DIR ) . ltrim( $relative_path, '/' );

	if ( file_exists( $path ) ) {
		return (string) filemtime( $path );
	}

	return wp_get_theme()->get( 'Version' );
}

function liquidglass_scripts() {
	// 主样式表
	wp_enqueue_style( 'liquidglass-style', get_stylesheet_uri(), array(), liquidglass_asset_version( 'style.css' ) );
	// 自定义主样式（毛玻璃效果等）
	wp_enqueue_style( 'liquidglass-main', LIQUIDGLASS_THEME_URI . '/assets/css/main.css', array(), liquidglass_asset_version( 'assets/css/main.css' ) );

	// 脚本文件（在页面底部加载）
	wp_enqueue_script( 'liquidglass-scripts', LIQUIDGLASS_THEME_URI . '/assets/js/scripts.js', array(), liquidglass_asset_version( 'assets/js/scripts.js' ), true );
	if ( is_singular( 'post' ) ) {
		wp_enqueue_style( 'law100-reading', LIQUIDGLASS_THEME_URI . '/assets/css/reading.css', array( 'liquidglass-main' ), liquidglass_asset_version( 'assets/css/reading.css' ) );
		wp_enqueue_script( 'law100-reading', LIQUIDGLASS_THEME_URI . '/assets/js/reading.js', array( 'liquidglass-scripts' ), liquidglass_asset_version( 'assets/js/reading.js' ), true );
	}

	if ( ! is_page( 'drive' ) ) {
		wp_enqueue_style( 'law100-appearance', LIQUIDGLASS_THEME_URI . '/assets/css/appearance.css', is_singular( 'post' ) ? array( 'law100-reading' ) : array( 'liquidglass-main' ), liquidglass_asset_version( 'assets/css/appearance.css' ) );
	}
	// 如果支持评论且有评论，加载评论回复脚本
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'liquidglass_scripts' );

/**
 * 注册自定义器选项
 */
function liquidglass_customize_register( $wp_customize ) {
	// 站点标题颜色
	$wp_customize->add_setting( 'liquidglass_title_color', array(
		'default'           => '#1d1d1f',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'postMessage',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'liquidglass_title_color', array(
		'label'    => esc_html__( '站点标题颜色', 'liquidglass' ),
		'section'  => 'title_tagline',
		'settings' => 'liquidglass_title_color',
	) ) );

	// 标语颜色
	$wp_customize->add_setting( 'liquidglass_tagline_color', array(
		'default'           => '#86868b',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'postMessage',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'liquidglass_tagline_color', array(
		'label'    => esc_html__( '标语颜色', 'liquidglass' ),
		'section'  => 'title_tagline',
		'settings' => 'liquidglass_tagline_color',
	) ) );

	// 主题主色
	$wp_customize->add_setting( 'liquidglass_primary_color', array(
		'default'           => '#007AFF',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'postMessage',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'liquidglass_primary_color', array(
		'label'    => esc_html__( '主题主色（链接、按钮等）', 'liquidglass' ),
		'section'  => 'colors',
		'settings' => 'liquidglass_primary_color',
	) ) );

	// 强调色
	$wp_customize->add_setting( 'liquidglass_accent_color', array(
		'default'           => '#5856D6',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'postMessage',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'liquidglass_accent_color', array(
		'label'    => esc_html__( '强调色（渐变紫等）', 'liquidglass' ),
		'section'  => 'colors',
		'settings' => 'liquidglass_accent_color',
	) ) );

	// 首页布局选择
	$wp_customize->add_section( 'liquidglass_home_settings', array(
		'title'    => esc_html__( '首页布局', 'liquidglass' ),
		'priority' => 30,
	) );
	$wp_customize->add_setting( 'liquidglass_home_layout', array(
		'default'           => 'blog',
		'transport'         => 'refresh',
		'sanitize_callback' => 'sanitize_text_field',
	) );
	$wp_customize->add_control( 'liquidglass_home_layout', array(
		'label'    => esc_html__( '选择首页布局', 'liquidglass' ),
		'section'  => 'liquidglass_home_settings',
		'type'     => 'radio',
		'choices'  => array(
			'blog'    => esc_html__( '博客流（标准列表）', 'liquidglass' ),
			'magazine'=> esc_html__( '杂志流（卡片网格）', 'liquidglass' ),
		),
	) );

	// 首页英雄背景图片
	$wp_customize->add_setting( 'liquidglass_hero_image', array(
		'default'           => get_theme_file_uri( 'assets/images/hero-default.svg' ),
		'transport'         => 'refresh',
		'sanitize_callback' => 'esc_url_raw',
	) );
	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'liquidglass_hero_image', array(
		'label'    => esc_html__( '首页背景风景图', 'liquidglass' ),
		'description' => esc_html__( '未选择自定义图片时，使用主题自带的默认风景图。', 'liquidglass' ),
		'section'  => 'liquidglass_home_settings',
		'settings' => 'liquidglass_hero_image',
	) ) );

	// 动画开关
	$wp_customize->add_setting( 'liquidglass_animation_enabled', array(
		'default'           => true,
		'transport'         => 'refresh',
		'sanitize_callback' => 'wp_validate_boolean',
	) );
	$wp_customize->add_control( 'liquidglass_animation_enabled', array(
		'label'       => esc_html__( '启用滚动动画', 'liquidglass' ),
		'section'     => 'liquidglass_home_settings',
		'type'        => 'checkbox',
	) );

	// 个人资料与社交入口。
	$wp_customize->add_section( 'liquidglass_profile_settings', array(
		'title'       => esc_html__( '个人资料与社交', 'liquidglass' ),
		'description' => esc_html__( '用于首页与“关于我”页面。社交地址可以随时替换为你的个人主页。', 'liquidglass' ),
		'priority'    => 31,
	) );

	$wp_customize->add_setting( 'liquidglass_profile_image', array(
		'default'           => '',
		'transport'         => 'refresh',
		'sanitize_callback' => 'esc_url_raw',
	) );
	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'liquidglass_profile_image', array(
		'label'    => esc_html__( '个人照片', 'liquidglass' ),
		'section'  => 'liquidglass_profile_settings',
		'settings' => 'liquidglass_profile_image',
	) ) );

	$wp_customize->add_setting( 'liquidglass_profile_intro', array(
		'default'           => '一名仍在学习、也喜欢亲手折腾工具与服务器的大学生。这里记录城市漫游、技术实践和日常观察。',
		'transport'         => 'refresh',
		'sanitize_callback' => 'sanitize_textarea_field',
	) );
	$wp_customize->add_control( 'liquidglass_profile_intro', array(
		'label'   => esc_html__( '个人简介', 'liquidglass' ),
		'section' => 'liquidglass_profile_settings',
		'type'    => 'textarea',
	) );

	$wp_customize->add_setting( 'liquidglass_github_url', array(
		'default'           => 'https://github.com/',
		'transport'         => 'refresh',
		'sanitize_callback' => 'esc_url_raw',
	) );
	$wp_customize->add_control( 'liquidglass_github_url', array(
		'label'       => esc_html__( 'GitHub 个人主页', 'liquidglass' ),
		'description' => esc_html__( '当前默认打开 GitHub 首页，请替换为你的个人主页地址。', 'liquidglass' ),
		'section'     => 'liquidglass_profile_settings',
		'type'        => 'url',
	) );

	$wp_customize->add_setting( 'liquidglass_bilibili_url', array(
		'default'           => 'https://www.bilibili.com/',
		'transport'         => 'refresh',
		'sanitize_callback' => 'esc_url_raw',
	) );
	$wp_customize->add_control( 'liquidglass_bilibili_url', array(
		'label'       => esc_html__( '哔哩哔哩个人空间', 'liquidglass' ),
		'description' => esc_html__( '当前默认打开哔哩哔哩首页，请替换为你的个人空间地址。', 'liquidglass' ),
		'section'     => 'liquidglass_profile_settings',
		'type'        => 'url',
	) );

	$wp_customize->add_setting( 'liquidglass_public_email', array(
		'default'           => '',
		'transport'         => 'refresh',
		'sanitize_callback' => 'sanitize_email',
	) );
	$wp_customize->add_control( 'liquidglass_public_email', array(
		'label'       => esc_html__( '公开联系邮箱', 'liquidglass' ),
		'description' => esc_html__( '留空时邮箱图标作为预留位显示，但不会公开管理邮箱或产生跳转。', 'liquidglass' ),
		'section'     => 'liquidglass_profile_settings',
		'type'        => 'email',
	) );
}
add_action( 'customize_register', 'liquidglass_customize_register' );

/**
 * 将自定义器设置注入到页面CSS中（动态输出）
 */
function liquidglass_customizer_css() {
	?>
	<style type="text/css" id="liquidglass-custom-styles">
		:root {
			--liquidglass-title-color: var(--appearance-ink, <?php echo esc_attr( get_theme_mod( 'liquidglass_title_color', '#1d1d1f' ) ); ?>);
			--liquidglass-tagline-color: var(--appearance-muted, <?php echo esc_attr( get_theme_mod( 'liquidglass_tagline_color', '#86868b' ) ); ?>);
			--liquidglass-primary: var(--appearance-link, <?php echo esc_attr( get_theme_mod( 'liquidglass_primary_color', '#007AFF' ) ); ?>);
			--liquidglass-accent: var(--appearance-link-hover, <?php echo esc_attr( get_theme_mod( 'liquidglass_accent_color', '#5856D6' ) ); ?>);
		}
		.site-title a {
			color: var(--liquidglass-title-color);
		}
		.site-description {
			color: var(--liquidglass-tagline-color);
		}
	</style>
	<?php
}
add_action( 'wp_head', 'liquidglass_customizer_css' );

/**
 * 启用动画类（根据自定义器设置，在body上添加类）
 */
function liquidglass_body_classes( $classes ) {
	if ( get_theme_mod( 'liquidglass_animation_enabled', true ) ) {
		$classes[] = 'animations-enabled';
	} else {
		$classes[] = 'animations-disabled';
	}
	return $classes;
}
add_filter( 'body_class', 'liquidglass_body_classes' );

/**
 * 为以英文为主的文章添加语言类，便于使用更适合英文阅读的字体。
 */
function liquidglass_english_post_class( $classes ) {
	if ( ! is_singular( 'post' ) ) {
		return $classes;
	}

	$post_id = get_queried_object_id();
	$text    = wp_strip_all_tags(
		get_post_field( 'post_title', $post_id ) . ' ' . get_post_field( 'post_content', $post_id )
	);

	if ( preg_match( '/[A-Za-z]/', $text ) && ! preg_match( '/[\x{4e00}-\x{9fff}]/u', $text ) ) {
		$classes[] = 'english-post';
	}

	return $classes;
}
add_filter( 'body_class', 'liquidglass_english_post_class' );

/**
 * “联系”内容已整合到“关于”，保留旧地址并跳到对应锚点。
 */
function liquidglass_redirect_contact_to_about() {
	if ( ! is_admin() && is_page( 'contact' ) ) {
		wp_safe_redirect( home_url( '/about/#contact' ), 301 );
		exit;
	}
}
add_action( 'template_redirect', 'liquidglass_redirect_contact_to_about' );

/**
 * 首页提前加载 Hero 专用字体，减少打字动画开始时的字体跳变。
 */
function liquidglass_preload_hero_font() {
	if ( ! is_front_page() || ! is_home() ) {
		return;
	}

	$font_path = get_template_directory() . '/assets/fonts/pingfang-shangshangqian.ttf';
	$font_url  = get_template_directory_uri() . '/assets/fonts/pingfang-shangshangqian.ttf';

	if ( ! file_exists( $font_path ) ) {
		return;
	}

	printf(
		'<link rel="preload" href="%s" as="font" type="font/ttf" crossorigin>' . "\n",
		esc_url( $font_url )
	);
}
add_action( 'wp_head', 'liquidglass_preload_hero_font', 2 );

/**
 * 设置阅读更多字样
 */
function liquidglass_excerpt_more( $more ) {
	if ( ! is_admin() ) {
		return ' &hellip;';
	}
	return $more;
}
add_filter( 'excerpt_more', 'liquidglass_excerpt_more' );

/**
 * 根据中英文内容估算阅读时间。
 */
function liquidglass_reading_content( $content ) {
	$items = array(); $used = array();
	$tags = new WP_HTML_Tag_Processor( $content );
	while ( $tags->next_tag() ) {
		$id = $tags->get_attribute( 'id' );
		if ( is_string( $id ) && '' !== $id ) { $used[ $id ] = true; }
	}
	$content = preg_replace_callback( '/<h([23])\b([^>]*)>(.*?)<\/h\1\s*>/is', function ( $match ) use ( &$items, &$used ) {
		$tag = new WP_HTML_Tag_Processor( $match[0] ); $tag->next_tag();
		$id = $tag->get_attribute( 'id' );
		if ( ! is_string( $id ) || '' === $id ) {
			$n = count( $items ) + 1;
			do { $id = 'reading-section-' . $n++; } while ( isset( $used[ $id ] ) );
			$tag->set_attribute( 'id', $id ); $used[ $id ] = true;
		}
		$items[] = array( 'id' => $id, 'level' => $match[1], 'text' => wp_strip_all_tags( $match[3] ) );
		return $tag->get_updated_html();
	}, $content );
	$toc = '';
	if ( count( $items ) >= 3 ) {
		$toc = '<details class="reading-toc"><summary>文章目录</summary><nav aria-label="文章目录"><ol>';
		foreach ( $items as $item ) {
			$toc .= '<li class="toc-level-' . esc_attr( $item['level'] ) . '"><a href="#' . esc_attr( rawurlencode( $item['id'] ) ) . '">' . esc_html( $item['text'] ) . '</a></li>';
		}
		$toc .= '</ol></nav></details>';
	}
	return array( 'content' => $content, 'toc' => $toc );
}

function liquidglass_reading_time( $post_id = 0 ) {
	$post_id = $post_id ? absint( $post_id ) : get_the_ID();
	$content = wp_strip_all_tags( strip_shortcodes( get_post_field( 'post_content', $post_id ) ) );

	preg_match_all( '/[\x{4e00}-\x{9fff}]/u', $content, $han_matches );
	$han_count = count( $han_matches[0] );
	$latin     = preg_replace( '/[\x{4e00}-\x{9fff}]/u', ' ', $content );
	$word_count = str_word_count( $latin );
	$minutes   = max( 1, (int) ceil( ( $han_count / 300 ) + ( $word_count / 220 ) ) );

	return sprintf( esc_html__( '%d 分钟阅读', 'liquidglass' ), $minutes );
}

/**
 * Render comments as a quiet, editorial discussion thread.
 */
function liquidglass_render_comment( $comment, $args, $depth ) {
	$comment_type = get_comment_type( $comment );

	if ( in_array( $comment_type, array( 'pingback', 'trackback' ), true ) ) :
		?>
		<li <?php comment_class( 'discussion-reference' ); ?> id="comment-<?php comment_ID(); ?>">
			<article class="discussion-reference__inner">
				<span><?php esc_html_e( '引用本文', 'liquidglass' ); ?></span>
				<strong><?php echo esc_html( get_comment_author( $comment ) ); ?></strong>
			</article>
		<?php
		return;
	endif;

	$is_post_author = (int) $comment->user_id > 0
		&& (int) $comment->user_id === (int) get_post_field( 'post_author', $comment->comment_post_ID );
	$is_savio_user = '1' === get_comment_meta( $comment->comment_ID, '_law100_savio_verified', true );
	?>
	<li <?php comment_class( 'discussion-item' ); ?> id="comment-<?php comment_ID(); ?>">
		<article id="div-comment-<?php comment_ID(); ?>" class="discussion-comment">
			<div class="discussion-avatar" aria-hidden="true">
				<img src="<?php echo esc_url( get_theme_file_uri( '/assets/icons/comment-user.svg' ) ); ?>" alt="" width="40" height="40">
			</div>
			<div class="discussion-body">
				<header class="discussion-meta">
					<strong class="discussion-author"><?php echo esc_html( get_comment_author( $comment ) ); ?></strong>
					<?php if ( $is_savio_user ) : ?>
						<span class="discussion-author-mark discussion-author-mark--savio"><?php esc_html_e( 'Savio 已验证', 'liquidglass' ); ?></span>
					<?php endif; ?>
					<?php if ( $is_post_author ) : ?>
						<span class="discussion-author-mark"><?php esc_html_e( '作者', 'liquidglass' ); ?></span>
					<?php endif; ?>
					<a class="discussion-date" href="<?php echo esc_url( get_comment_link( $comment, $args ) ); ?>">
						<time datetime="<?php comment_time( 'c' ); ?>">
							<?php echo esc_html( get_comment_date( 'Y.m.d', $comment ) . ' ' . get_comment_time( 'H:i', false, false, $comment ) ); ?>
						</time>
					</a>
				</header>

				<?php if ( '0' === $comment->comment_approved ) : ?>
					<p class="discussion-moderation"><?php esc_html_e( '等待审核', 'liquidglass' ); ?></p>
				<?php endif; ?>

				<div class="discussion-content">
					<?php comment_text(); ?>
				</div>

				<?php if ( comments_open( $comment->comment_post_ID ) ) : ?>
					<div class="discussion-actions">
						<?php
						comment_reply_link(
							array_merge(
								$args,
								array(
									'add_below'  => 'div-comment',
									'depth'      => $depth,
									'max_depth'  => $args['max_depth'],
									'reply_text' => esc_html__( '回复', 'liquidglass' ),
								)
							)
						);
						?>
					</div>
				<?php endif; ?>
			</div>
		</article>
	<?php
}

/**
 * 侧边栏小工具标题自动翻译为中文
 */
function liquidglass_sidebar_widgets_cn() {
	ob_start( function ( $html ) {
		$map = array(
			'Recent Posts'    => '最新文章',
			'Recent Comments' => '最新评论',
			'Archives'        => '归档',
			'Categories'      => '分类',
			'Meta'            => '功能',
			'Search'          => '搜索',
			'Tags'            => '标签',
			'Calendar'        => '日历',
		);
		return str_replace( array_keys( $map ), array_values( $map ), $html );
	} );
}
add_action( 'dynamic_sidebar_before', 'liquidglass_sidebar_widgets_cn' );
add_action( 'dynamic_sidebar_after', function () { if ( ob_get_level() ) ob_end_flush(); } );

/**
 * 更新日志只通过直接地址访问，不进入站内搜索、站点地图或搜索引擎索引。
 */
function liquidglass_changelog_page_id() {
	static $page_id = null;

	if ( null === $page_id ) {
		$page    = get_page_by_path( 'changelog', OBJECT, 'page' );
		$page_id = $page ? (int) $page->ID : 0;
	}

	return $page_id;
}

function liquidglass_hide_changelog_from_search( $query ) {
	if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
		return;
	}

	$page_id = liquidglass_changelog_page_id();
	if ( $page_id ) {
		$excluded   = array_map( 'absint', (array) $query->get( 'post__not_in' ) );
		$excluded[] = $page_id;
		$query->set( 'post__not_in', array_values( array_unique( $excluded ) ) );
	}
}
add_action( 'pre_get_posts', 'liquidglass_hide_changelog_from_search' );

function liquidglass_hide_changelog_from_sitemap( $args, $post_type ) {
	if ( 'page' !== $post_type ) {
		return $args;
	}

	$page_id = liquidglass_changelog_page_id();
	if ( $page_id ) {
		$args['post__not_in'] = array_values(
			array_unique( array_merge( (array) ( $args['post__not_in'] ?? array() ), array( $page_id ) ) )
		);
	}

	return $args;
}
add_filter( 'wp_sitemaps_posts_query_args', 'liquidglass_hide_changelog_from_sitemap', 10, 2 );

function liquidglass_changelog_robots( $robots ) {
	if ( is_page( 'changelog' ) ) {
		$robots['noindex']  = true;
		$robots['nofollow'] = true;
		$robots['noarchive'] = true;
	}

	return $robots;
}
add_filter( 'wp_robots', 'liquidglass_changelog_robots' );

?>
