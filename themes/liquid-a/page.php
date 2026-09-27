<?php
/**
 * 页面模板。
 */
get_header();
?>

<main id="primary" class="site-main container">
	<?php
	while ( have_posts() ) :
		the_post();

		if ( is_page( 'about' ) ) :
			$legacy_intro  = '一名仍在学习、也喜欢亲手折腾工具与服务器的大学生。这里记录城市漫游、技术实践和日常观察。';
			$profile_intro = trim( get_theme_mod( 'liquidglass_profile_intro', '' ) );
			if ( ! $profile_intro || $legacy_intro === $profile_intro ) {
				$profile_intro = '我是一名大学生，正在开发 Android 应用，也喜欢亲手折腾服务器、同步服务和个人工具。这个博客用来记录旅行、技术实践，以及一些值得留下来的日常。';
			}
			$github_url    = get_theme_mod( 'liquidglass_github_url', 'https://github.com/' );
			$bilibili_url  = get_theme_mod( 'liquidglass_bilibili_url', 'https://www.bilibili.com/' );
			$public_email  = sanitize_email( get_theme_mod( 'liquidglass_public_email', '' ) );
			?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'about-page' ); ?>>
				<header class="about-opening">
					<h1 class="entry-title"><?php esc_html_e( '你好，我是 law100。', 'liquidglass' ); ?></h1>
					<p class="about-lead"><?php echo esc_html( $profile_intro ); ?></p>
				</header>

				<section class="about-workbench" aria-labelledby="about-workbench-title">
					<header class="about-workbench-intro">
						<h2 id="about-workbench-title"><?php esc_html_e( '最近在做', 'liquidglass' ); ?></h2>
						<p><?php esc_html_e( '一些正在使用、维护，也会继续迭代的东西。', 'liquidglass' ); ?></p>
					</header>
					<div class="about-projects">
						<article class="about-project">
							<div class="about-project-name">
								<h3>Savio</h3>
								<span><?php esc_html_e( 'Android 应用', 'liquidglass' ); ?></span>
							</div>
							<p><?php esc_html_e( '一款订阅记账应用。现在主要在完善数据同步、多设备一致性和离线使用体验。', 'liquidglass' ); ?></p>
						</article>
						<article class="about-project">
							<div class="about-project-name">
								<h3><?php esc_html_e( '个人服务器', 'liquidglass' ); ?></h3>
								<span><?php esc_html_e( '持续维护', 'liquidglass' ); ?></span>
							</div>
							<p><?php esc_html_e( '让博客、同步服务和正在实验的个人工具保持在线，也记录部署、维护与迁移中遇到的问题。', 'liquidglass' ); ?></p>
						</article>
						<article class="about-project">
							<div class="about-project-name">
								<h3><?php esc_html_e( '博客与记录', 'liquidglass' ); ?></h3>
								<span><?php esc_html_e( '慢慢更新', 'liquidglass' ); ?></span>
							</div>
							<p><?php esc_html_e( '把城市漫游、技术实践和阶段性的想法整理成文章，而不是只让它们留在临时笔记里。', 'liquidglass' ); ?></p>
						</article>
					</div>
				</section>

				<section class="about-friends" aria-labelledby="about-friends-title">
					<header class="about-friends-intro">
						<h2 id="about-friends-title"><?php esc_html_e( '友链', 'liquidglass' ); ?></h2>
					</header>
					<nav class="about-contact-list" aria-label="<?php esc_attr_e( '友情链接', 'liquidglass' ); ?>">
						<a class="about-contact-row" href="https://home.haoli.site/" target="_blank" rel="noopener noreferrer external">
							<span class="about-contact-main">
								<span class="about-contact-copy"><strong><?php esc_html_e( '毫厘的个人主页', 'liquidglass' ); ?></strong><small>home.haoli.site</small></span>
							</span>
							<span class="about-contact-arrow" aria-hidden="true">&#8599;</span>
						</a>
					</nav>
				</section>

				<section id="contact" class="about-connect" aria-labelledby="about-connect-title">
					<header class="about-connect-intro">
						<h2 id="about-connect-title"><?php esc_html_e( '联系', 'liquidglass' ); ?></h2>
						<p><?php esc_html_e( '想讨论某篇文章、项目或者一个具体问题，可以从下面这些地方开始。', 'liquidglass' ); ?></p>
					</header>
					<nav class="about-contact-list" aria-label="<?php esc_attr_e( '联系与社交入口', 'liquidglass' ); ?>">
						<a class="about-contact-row" href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noopener noreferrer">
							<span class="about-contact-main">
								<span class="about-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z"/></svg></span>
								<span class="about-contact-copy"><strong>GitHub</strong><small><?php esc_html_e( '项目与代码', 'liquidglass' ); ?></small></span>
							</span>
							<span class="about-contact-arrow" aria-hidden="true">&#8599;</span>
						</a>
						<a class="about-contact-row" href="<?php echo esc_url( $bilibili_url ); ?>" target="_blank" rel="noopener noreferrer">
							<span class="about-contact-main">
								<span class="about-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/></svg></span>
								<span class="about-contact-copy"><strong><?php esc_html_e( '哔哩哔哩', 'liquidglass' ); ?></strong><small><?php esc_html_e( '视频与轻松一点的内容', 'liquidglass' ); ?></small></span>
							</span>
							<span class="about-contact-arrow" aria-hidden="true">&#8599;</span>
						</a>
						<?php if ( $public_email ) : ?>
							<a class="about-contact-row" href="mailto:<?php echo esc_attr( $public_email ); ?>">
								<span class="about-contact-main">
									<span class="about-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg></span>
									<span class="about-contact-copy"><strong><?php esc_html_e( '邮箱', 'liquidglass' ); ?></strong><small><?php echo esc_html( $public_email ); ?></small></span>
								</span>
								<span class="about-contact-arrow" aria-hidden="true">&#8599;</span>
							</a>
						<?php else : ?>
							<div class="about-contact-row is-unavailable" aria-label="<?php esc_attr_e( '公开邮箱暂未设置', 'liquidglass' ); ?>">
								<span class="about-contact-main">
									<span class="about-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg></span>
									<span class="about-contact-copy"><strong><?php esc_html_e( '邮箱', 'liquidglass' ); ?></strong><small><?php esc_html_e( '暂未公开', 'liquidglass' ); ?></small></span>
								</span>
								<span class="about-contact-arrow" aria-hidden="true">&#8212;</span>
							</div>
						<?php endif; ?>
					</nav>
				</section>

			</article>
		<?php elseif ( is_page( 'contact' ) ) : ?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'contact-page' ); ?>>
				<header class="contact-hero glass-card">
					<span class="page-eyebrow">CONTACT / <?php esc_html_e( '联系', 'liquidglass' ); ?></span>
					<h1 class="entry-title"><?php esc_html_e( '保持联系', 'liquidglass' ); ?></h1>
					<div class="contact-lead">
						<?php the_content(); ?>
					</div>
				</header>

				<section class="contact-grid" aria-label="<?php esc_attr_e( '交流方式', 'liquidglass' ); ?>">
					<article>
						<span class="contact-state"><?php esc_html_e( '随时可以', 'liquidglass' ); ?></span>
						<h2><?php esc_html_e( '文章评论', 'liquidglass' ); ?></h2>
						<p><?php esc_html_e( '如果想讨论某篇内容，直接在文章下面留言最合适，前后文也不会丢。', 'liquidglass' ); ?></p>
					</article>
					<article>
						<span class="contact-state"><?php esc_html_e( '首页入口', 'liquidglass' ); ?></span>
						<h2><?php esc_html_e( '社交平台', 'liquidglass' ); ?></h2>
						<p><?php esc_html_e( 'GitHub、哔哩哔哩和邮箱入口都放在首页 Hero 下方，个人账号与公开邮箱可在主题设置中随时绑定。', 'liquidglass' ); ?></p>
					</article>
					<article>
						<span class="contact-state is-muted"><?php esc_html_e( '预留位置', 'liquidglass' ); ?></span>
						<h2><?php esc_html_e( '正式联系', 'liquidglass' ); ?></h2>
						<p><?php esc_html_e( '邮箱或其他正式联系方式将在准备好后补充，这里不会提前公开私人信息。', 'liquidglass' ); ?></p>
					</article>
				</section>

				<div class="page-actions">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="page-action-link page-action-link--back">
						<span class="button-arrow" aria-hidden="true">&#8592;</span>
						<span><?php esc_html_e( '返回首页', 'liquidglass' ); ?></span>
					</a>
				</div>
			</article>
		<?php else : ?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'single-article glass-card' ); ?>>
				<header class="entry-header">
					<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
				</header>
				<div class="entry-content glass-content">
					<?php the_content(); ?>
				</div>
			</article>
		<?php endif;
	endwhile;
	?>
</main><!-- #primary -->

<?php
get_footer();
