<?php
/**
 * Theme-level comments template.
 */

if ( post_password_required() ) {
	return;
}

$comment_count = get_comments_number();
$commenter     = wp_get_current_commenter();
$required      = (bool) get_option( 'require_name_email' );
$aria_required = $required ? ' aria-required="true"' : '';
$html_required = $required ? ' required' : '';

$fields = array(
	'author' => sprintf(
		'<p class="comment-form-author"><label for="author">%1$s%2$s</label><input id="author" name="author" type="text" value="%3$s" maxlength="245" autocomplete="name"%4$s%5$s></p>',
		esc_html__( '显示名称', 'liquidglass' ),
		$required ? ' <span class="required" aria-hidden="true">*</span>' : '',
		esc_attr( $commenter['comment_author'] ),
		$aria_required,
		$html_required
	),
	'email'  => sprintf(
		'<p class="comment-form-email"><label for="email">%1$s%2$s</label><input id="email" name="email" type="email" value="%3$s" maxlength="100" autocomplete="email"%4$s%5$s></p>',
		esc_html__( '邮箱', 'liquidglass' ),
		$required ? ' <span class="required" aria-hidden="true">*</span>' : '',
		esc_attr( $commenter['comment_author_email'] ),
		$aria_required,
		$html_required
	),
);

if ( get_option( 'show_comments_cookies_opt_in' ) ) {
	$consent = empty( $commenter['comment_author_email'] ) ? '' : ' checked="checked"';
	$fields['cookies'] = sprintf(
		'<p class="comment-form-cookies-consent"><input id="wp-comment-cookies-consent" name="wp-comment-cookies-consent" type="checkbox" value="yes"%1$s><label for="wp-comment-cookies-consent">%2$s</label></p>',
		$consent,
		esc_html__( '记住我的信息，方便下次留言', 'liquidglass' )
	);
}
?>

<section id="comments" class="comments-area discussion-sheet" aria-labelledby="discussion-title">
	<header class="discussion-header">
		<h2 id="discussion-title"><?php esc_html_e( '讨论', 'liquidglass' ); ?></h2>
		<span class="discussion-count"><?php echo esc_html( sprintf( _n( '%s 条', '%s 条', $comment_count, 'liquidglass' ), number_format_i18n( $comment_count ) ) ); ?></span>
	</header>

	<?php if ( have_comments() ) : ?>
		<ol class="comment-list discussion-list">
			<?php
			wp_list_comments(
				array(
					'callback'    => 'liquidglass_render_comment',
					'style'       => 'ol',
					'short_ping'  => true,
					'avatar_size' => 0,
					'max_depth'   => 5,
					'reply_to_text' => esc_html__( '正在回复给 %s', 'liquidglass' ),
				)
			);
			?>
		</ol>

		<?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : ?>
			<nav class="discussion-navigation" aria-label="<?php esc_attr_e( '评论分页', 'liquidglass' ); ?>">
				<div><?php previous_comments_link( esc_html__( '较早的讨论', 'liquidglass' ) ); ?></div>
				<div><?php next_comments_link( esc_html__( '较新的讨论', 'liquidglass' ) ); ?></div>
			</nav>
		<?php endif; ?>
	<?php elseif ( comments_open() ) : ?>
		<p class="discussion-empty"><?php esc_html_e( '还没有评论，欢迎留下你的想法。', 'liquidglass' ); ?></p>
	<?php endif; ?>

	<?php if ( comments_open() ) : ?>
		<?php
		comment_form(
			array(
				'fields'               => $fields,
				'comment_field'         => '<p class="comment-form-comment"><label class="screen-reader-text" for="comment">' . esc_html__( '评论内容', 'liquidglass' ) . '</label><textarea id="comment" name="comment" maxlength="65525" required aria-required="true" placeholder="' . esc_attr__( '写下你的想法……', 'liquidglass' ) . '"></textarea></p>',
				'comment_notes_before'  => '',
				'comment_notes_after'   => '',
				'title_reply'           => esc_html__( '留下回应', 'liquidglass' ),
				'title_reply_to'        => esc_html__( '正在回复给 %s', 'liquidglass' ),
				'cancel_reply_link'     => esc_html__( '取消回复', 'liquidglass' ),
				'label_submit'          => esc_html__( '发布评论', 'liquidglass' ),
				'class_form'            => 'comment-form discussion-form',
				'class_submit'          => 'submit discussion-submit',
				'submit_button'         => '<button name="%1$s" type="submit" id="%2$s" class="%3$s">%4$s</button>',
				'logged_in_as'          => '<p class="logged-in-as">' . sprintf(
					wp_kses(
						__( '当前以 %1$s 登录。%2$s退出%3$s', 'liquidglass' ),
						array( 'a' => array( 'href' => true ) )
					),
					'<strong>' . esc_html( wp_get_current_user()->display_name ) . '</strong>',
					'<a href="' . esc_url( wp_logout_url( get_permalink() ) ) . '">',
					'</a>'
				) . '</p>',
			)
		);
		?>
	<?php else : ?>
		<p class="discussion-closed"><?php esc_html_e( '评论已关闭。', 'liquidglass' ); ?></p>
	<?php endif; ?>
</section>
