<?php
/**
 * 首页底部的社交媒体与邮箱入口。
 */
$github_url   = get_theme_mod( 'liquidglass_github_url', 'https://github.com/' );
$bilibili_url = get_theme_mod( 'liquidglass_bilibili_url', 'https://www.bilibili.com/' );
$public_email = sanitize_email( get_theme_mod( 'liquidglass_public_email', '' ) );
?>

<section class="home-contact" aria-labelledby="home-contact-title">
	<div class="container home-contact-inner">
		<nav class="social-dock" aria-label="<?php esc_attr_e( '社交媒体与邮箱', 'liquidglass' ); ?>">
			<span id="home-contact-title" class="social-dock-label"><?php esc_html_e( '联系', 'liquidglass' ); ?></span>
			<div class="social-dock-links">
				<a class="social-link" href="<?php echo esc_url( $github_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-label="GitHub">
					<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z"/>
					</svg>
				</a>
				<a class="social-link" href="<?php echo esc_url( $bilibili_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="哔哩哔哩" data-label="哔哩哔哩">
					<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/>
					</svg>
				</a>
				<?php if ( $public_email ) : ?>
					<a class="social-link" href="mailto:<?php echo esc_attr( $public_email ); ?>" aria-label="<?php esc_attr_e( '发送邮件', 'liquidglass' ); ?>" data-label="<?php esc_attr_e( '邮箱', 'liquidglass' ); ?>">
				<?php else : ?>
					<span class="social-link social-link--placeholder" aria-label="<?php esc_attr_e( '邮箱待配置', 'liquidglass' ); ?>" data-label="<?php esc_attr_e( '邮箱待配置', 'liquidglass' ); ?>">
				<?php endif; ?>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
						<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>
					</svg>
				<?php if ( $public_email ) : ?>
					</a>
				<?php else : ?>
					</span>
				<?php endif; ?>
			</div>
		</nav>
	</div>
</section>
