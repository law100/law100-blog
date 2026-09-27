<?php
/**
 * Plugin Name: law100 Studio
 * Description: Independent, focused content workspace backed by WordPress.
 * Version: 1.0.0
 * Author: law100
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Requires PHP: 8.1
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Law100_Studio {
	const VERSION = '1.0.0';
	const REST_NS = 'law100-studio/v1';
	const NATIVE_COOKIE = 'law100_native_admin';
	const NATIVE_TTL = 1800;

	private static $instance;

	public static function instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'register_routes' ) );
		add_filter( 'query_vars', array( $this, 'query_vars' ) );
		add_action( 'template_redirect', array( $this, 'render_route' ), 0 );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
		add_action( 'admin_init', array( $this, 'redirect_native_admin' ), 0 );
		add_action( 'login_enqueue_scripts', array( $this, 'enqueue_native_login_style' ), 100 );
		add_filter( 'login_headerurl', static function () { return home_url( '/studio/login/' ); } );
		add_filter( 'login_headertext', static function () { return 'law100 Studio'; } );
		add_filter( 'show_admin_bar', '__return_false', 1000 );
		add_filter( 'wp_sitemaps_posts_query_args', array( $this, 'exclude_virtual_routes' ), 10, 2 );
	}

	public static function activate() {
		self::instance()->register_routes();
		if ( false === get_option( 'law100_studio_redirect_native', false ) ) {
			add_option( 'law100_studio_redirect_native', '0', '', false );
		}
		flush_rewrite_rules( false );
	}

	public static function deactivate() {
		flush_rewrite_rules( false );
	}

	public function register_routes() {
		add_rewrite_rule( '^studio/login/?$', 'index.php?law100_studio_login=1', 'top' );
		add_rewrite_rule( '^studio(?:/.*)?/?$', 'index.php?law100_studio=1', 'top' );
	}

	public function query_vars( $vars ) {
		$vars[] = 'law100_studio';
		$vars[] = 'law100_studio_login';
		return $vars;
	}

	public function exclude_virtual_routes( $args, $post_type ) {
		return $args;
	}

	private function send_studio_headers() {
		nocache_headers();
		header( 'X-Robots-Tag: noindex, noarchive, nofollow', true );
		header( 'X-Frame-Options: SAMEORIGIN', true );
		header( 'Referrer-Policy: same-origin', true );
		header( "Permissions-Policy: camera=(), microphone=(), geolocation=()", true );
		header( "Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; style-src 'self'; script-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'", true );
	}

	public function render_route() {
		if ( get_query_var( 'law100_studio_login' ) ) {
			$this->render_login();
		}

		if ( ! get_query_var( 'law100_studio' ) ) {
			return;
		}

		if ( ! is_user_logged_in() || ! current_user_can( 'edit_posts' ) ) {
			wp_safe_redirect( home_url( '/studio/login/' ) );
			exit;
		}

		$this->send_studio_headers();
		$assets = $this->asset_manifest();
		$studio_config = array(
			'restRoot' => untrailingslashit( rest_url() ),
			'nonce'    => wp_create_nonce( 'wp_rest' ),
			'homeUrl'  => home_url( '/' ),
			'driveUrl' => home_url( '/drive/' ),
			'studioUrl'=> home_url( '/studio/' ),
		);
		require plugin_dir_path( __FILE__ ) . 'templates/shell.php';
		exit;
	}

	private function render_login() {
		if ( is_user_logged_in() && current_user_can( 'edit_posts' ) ) {
			wp_safe_redirect( home_url( '/studio/' ) );
			exit;
		}

		$login_error = '';
		if ( 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			$ip_key = 'law100_studio_login_' . hash_hmac( 'sha256', (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ), wp_salt( 'nonce' ) );
			$attempts = (int) get_transient( $ip_key );
			if ( $attempts >= 8 ) {
				$login_error = '尝试次数过多，请十分钟后再试。';
			} elseif ( ! isset( $_POST['law100_studio_login_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['law100_studio_login_nonce'] ) ), 'law100_studio_login' ) ) {
				$login_error = '登录页面已过期，请刷新后重试。';
			} else {
				$credentials = array(
					'user_login'    => sanitize_user( wp_unslash( $_POST['log'] ?? '' ) ),
					'user_password' => (string) wp_unslash( $_POST['pwd'] ?? '' ),
					'remember'      => ! empty( $_POST['rememberme'] ),
				);
				$user = wp_signon( $credentials, true );
				if ( ! is_wp_error( $user ) && user_can( $user, 'edit_posts' ) ) {
					delete_transient( $ip_key );
					wp_safe_redirect( home_url( '/studio/' ) );
					exit;
				}
				set_transient( $ip_key, $attempts + 1, 10 * MINUTE_IN_SECONDS );
				$login_error = '账号或密码不正确。';
			}
		}

		$this->send_studio_headers();
		$assets = $this->asset_manifest();
		require plugin_dir_path( __FILE__ ) . 'templates/login.php';
		exit;
	}

	private function asset_manifest() {
		$manifest_path = plugin_dir_path( __FILE__ ) . 'dist/.vite/manifest.json';
		if ( ! is_readable( $manifest_path ) ) {
			wp_die( 'Studio 静态资源尚未构建。', 'Studio', array( 'response' => 503 ) );
		}
		$manifest = json_decode( file_get_contents( $manifest_path ), true );
		$entry = $manifest['src/main.tsx'] ?? array();
		return array(
			'js'  => isset( $entry['file'] ) ? plugin_dir_url( __FILE__ ) . 'dist/' . $entry['file'] : '',
			'logo' => isset( $manifest['src/assets/law100s_studio_logo_sharp.svg']['file'] ) ? plugin_dir_url( __FILE__ ) . 'dist/' . $manifest['src/assets/law100s_studio_logo_sharp.svg']['file'] : '',
			'css' => array_map( static function ( $file ) {
				return plugin_dir_url( __FILE__ ) . 'dist/' . $file;
			}, $entry['css'] ?? array() ),
		);
	}

	public function enqueue_native_login_style() {
		$assets = $this->asset_manifest();
		foreach ( $assets['css'] as $index => $style_url ) {
			wp_enqueue_style( 'law100-studio-login-' . $index, $style_url, array(), self::VERSION );
		}
	}

	public function permission_edit() {
		return is_user_logged_in() && current_user_can( 'edit_posts' );
	}

	public function permission_manage() {
		return is_user_logged_in() && current_user_can( 'manage_options' );
	}

	public function register_rest_routes() {
		register_rest_route( self::REST_NS, '/bootstrap', array(
			'methods' => WP_REST_Server::READABLE,
			'callback' => array( $this, 'rest_bootstrap' ),
			'permission_callback' => array( $this, 'permission_edit' ),
		) );
		register_rest_route( self::REST_NS, '/dashboard', array(
			'methods' => WP_REST_Server::READABLE,
			'callback' => array( $this, 'rest_dashboard' ),
			'permission_callback' => array( $this, 'permission_edit' ),
		) );
		register_rest_route( self::REST_NS, '/documents/save', array(
			'methods' => WP_REST_Server::CREATABLE,
			'callback' => array( $this, 'rest_save_document' ),
			'permission_callback' => array( $this, 'permission_edit' ),
		) );
		register_rest_route( self::REST_NS, '/documents/(?P<id>\d+)/preview', array(
			'methods' => WP_REST_Server::READABLE,
			'callback' => array( $this, 'rest_preview' ),
			'permission_callback' => array( $this, 'permission_edit' ),
		) );
		register_rest_route( self::REST_NS, '/system-status', array(
			'methods' => WP_REST_Server::READABLE,
			'callback' => array( $this, 'rest_system_status' ),
			'permission_callback' => array( $this, 'permission_manage' ),
		) );
		register_rest_route( self::REST_NS, '/session/logout', array(
			'methods' => WP_REST_Server::CREATABLE,
			'callback' => array( $this, 'rest_logout' ),
			'permission_callback' => array( $this, 'permission_edit' ),
		) );
	}

	public function rest_bootstrap() {
		$user = wp_get_current_user();
		return rest_ensure_response( array(
			'user' => array(
				'id' => $user->ID,
				'name' => $user->display_name,
				'avatar' => get_avatar_url( $user->ID, array( 'size' => 64 ) ),
			),
			'site' => array(
				'name' => get_bloginfo( 'name' ),
				'url' => home_url( '/' ),
				'driveUrl' => home_url( '/drive/' ),
			),
			'capabilities' => array(
				'editPosts' => current_user_can( 'edit_posts' ),
				'editPages' => current_user_can( 'edit_pages' ),
				'moderateComments' => current_user_can( 'moderate_comments' ),
				'uploadFiles' => current_user_can( 'upload_files' ),
				'manageOptions' => current_user_can( 'manage_options' ),
			),
			'featurePages' => array( 'articles', 'drive', 'changelog' ),
		) );
	}

	public function rest_dashboard() {
		$post_counts = wp_count_posts( 'post' );
		$page_counts = wp_count_posts( 'page' );
		$comment_counts = wp_count_comments();
		$recent = get_posts( array(
			'post_type' => array( 'post', 'page' ),
			'post_status' => array( 'publish', 'draft', 'pending', 'future', 'private' ),
			'numberposts' => 8,
			'orderby' => 'modified',
			'order' => 'DESC',
		) );
		$pending = get_comments( array( 'status' => 'hold', 'number' => 5, 'orderby' => 'comment_date_gmt', 'order' => 'DESC' ) );
		return rest_ensure_response( array(
			'counts' => array(
				'posts' => (int) $post_counts->publish,
				'drafts' => (int) $post_counts->draft,
				'pages' => (int) $page_counts->publish,
				'pendingComments' => (int) $comment_counts->moderated,
			),
			'recent' => array_map( array( $this, 'document_summary' ), $recent ),
			'pendingComments' => array_map( array( $this, 'comment_summary' ), $pending ),
			'system' => $this->system_data(),
		) );
	}

	private function document_summary( $post ) {
		return array(
			'id' => (int) $post->ID,
			'type' => $post->post_type,
			'title' => get_the_title( $post ) ?: '无标题',
			'status' => $post->post_status,
			'slug' => $post->post_name,
			'modified' => mysql_to_rfc3339( $post->post_modified_gmt ),
			'link' => get_permalink( $post ),
		);
	}

	private function comment_summary( $comment ) {
		return array(
			'id' => (int) $comment->comment_ID,
			'author' => $comment->comment_author,
			'content' => wp_strip_all_tags( $comment->comment_content ),
			'date' => mysql_to_rfc3339( $comment->comment_date_gmt ),
			'postId' => (int) $comment->comment_post_ID,
			'postTitle' => get_the_title( $comment->comment_post_ID ),
		);
	}

	private function system_data() {
		global $wp_version;
		if ( ! function_exists( 'wp_get_update_data' ) ) {
			require_once ABSPATH . 'wp-admin/includes/update.php';
		}
		$updates = wp_get_update_data();
		$theme = wp_get_theme();
		return array(
			'wordpress' => $wp_version,
			'theme' => $theme->get( 'Name' ) . ' ' . $theme->get( 'Version' ),
			'updates' => (int) ( $updates['counts']['total'] ?? 0 ),
			'https' => is_ssl() && 0 === strpos( home_url(), 'https://' ),
		);
	}

	public function rest_system_status() {
		return rest_ensure_response( $this->system_data() );
	}

	public function rest_save_document( WP_REST_Request $request ) {
		$data = $request->get_json_params();
		$type = isset( $data['type'] ) && 'page' === $data['type'] ? 'page' : 'post';
		$id = absint( $data['id'] ?? 0 );
		$post = $id ? get_post( $id ) : null;
		if ( $id && ( ! $post || $type !== $post->post_type ) ) {
			return new WP_Error( 'studio_not_found', '文稿不存在。', array( 'status' => 404 ) );
		}
		$capability = $id ? 'edit_post' : ( 'page' === $type ? 'edit_pages' : 'edit_posts' );
		if ( ! current_user_can( $capability, $id ?: null ) ) {
			return new WP_Error( 'studio_forbidden', '没有编辑权限。', array( 'status' => 403 ) );
		}

		$base_modified = sanitize_text_field( $data['baseModified'] ?? '' );
		if ( $post && $base_modified && $base_modified !== $post->post_modified_gmt && empty( $data['force'] ) ) {
			return new WP_Error( 'studio_conflict', '服务器上的文稿已经更新。', array(
				'status' => 409,
				'server' => $this->document_summary( $post ),
			) );
		}

		$allowed_statuses = array( 'draft', 'publish', 'pending', 'private', 'future' );
		$status = sanitize_key( $data['status'] ?? 'draft' );
		if ( ! in_array( $status, $allowed_statuses, true ) ) {
			$status = 'draft';
		}
		if ( 'publish' === $status && ! current_user_can( 'publish_posts' ) ) {
			$status = 'pending';
		}

		$postarr = array(
			'ID' => $id,
			'post_type' => $type,
			'post_title' => sanitize_text_field( $data['title'] ?? '' ),
			'post_content' => wp_kses_post( $data['content'] ?? '' ),
			'post_excerpt' => sanitize_textarea_field( $data['excerpt'] ?? '' ),
			'post_status' => $status,
			'comment_status' => 'closed' === ( $data['commentStatus'] ?? '' ) ? 'closed' : 'open',
		);
		if ( ! empty( $data['slug'] ) ) {
			$postarr['post_name'] = sanitize_title( $data['slug'] );
		}
		if ( ! empty( $data['dateGmt'] ) ) {
			$postarr['post_date_gmt'] = sanitize_text_field( $data['dateGmt'] );
			$postarr['post_date'] = get_date_from_gmt( $postarr['post_date_gmt'] );
		}
		if ( 'post' === $type ) {
			$postarr['post_category'] = array_map( 'absint', (array) ( $data['categories'] ?? array() ) );
			$postarr['tax_input'] = array( 'post_tag' => array_map( 'absint', (array) ( $data['tags'] ?? array() ) ) );
		}

		if ( $post && 'page' === $type && in_array( $post->post_name, array( 'articles', 'drive', 'changelog' ), true ) ) {
			$postarr['post_name'] = $post->post_name;
			$postarr['post_status'] = $post->post_status;
		}

		$result = wp_insert_post( wp_slash( $postarr ), true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		if ( isset( $data['featuredMedia'] ) ) {
			$media_id = absint( $data['featuredMedia'] );
			$media_id ? set_post_thumbnail( $result, $media_id ) : delete_post_thumbnail( $result );
		}
		$saved = get_post( $result );
		return rest_ensure_response( array(
			'document' => $this->document_summary( $saved ),
			'baseModified' => $saved->post_modified_gmt,
			'editLink' => home_url( '/studio/' . ( 'page' === $type ? 'pages' : 'posts' ) . '/' . $result . '/' ),
		) );
	}

	public function rest_preview( WP_REST_Request $request ) {
		$id = absint( $request['id'] );
		if ( ! current_user_can( 'edit_post', $id ) ) {
			return new WP_Error( 'studio_forbidden', '没有预览权限。', array( 'status' => 403 ) );
		}
		return rest_ensure_response( array( 'url' => get_preview_post_link( $id ) ) );
	}

	public function rest_logout() {
		wp_logout();
		return rest_ensure_response( array( 'loginUrl' => home_url( '/studio/login/' ) ) );
	}

	private function native_cookie_value( $user_id, $expires ) {
		return $expires . '.' . hash_hmac( 'sha256', $user_id . '|' . $expires, wp_salt( 'auth' ) );
	}

	private function native_cookie_valid() {
		if ( empty( $_COOKIE[ self::NATIVE_COOKIE ] ) || ! is_user_logged_in() ) {
			return false;
		}
		$parts = explode( '.', sanitize_text_field( wp_unslash( $_COOKIE[ self::NATIVE_COOKIE ] ) ), 2 );
		if ( 2 !== count( $parts ) || (int) $parts[0] < time() ) {
			return false;
		}
		return hash_equals( $this->native_cookie_value( get_current_user_id(), (int) $parts[0] ), $parts[0] . '.' . $parts[1] );
	}

	public function redirect_native_admin() {
		if ( ! get_option( 'law100_studio_redirect_native' ) || ! is_user_logged_in() || ! current_user_can( 'edit_posts' ) || wp_doing_ajax() ) {
			return;
		}
		if ( current_user_can( 'manage_options' ) && isset( $_GET['law100-native'] ) && '1' === $_GET['law100-native'] ) {
			$expires = time() + self::NATIVE_TTL;
			setcookie( self::NATIVE_COOKIE, $this->native_cookie_value( get_current_user_id(), $expires ), array(
				'expires' => $expires,
				'path' => ADMIN_COOKIE_PATH,
				'secure' => true,
				'httponly' => true,
				'samesite' => 'Strict',
			) );
			return;
		}
		if ( $this->native_cookie_valid() ) {
			return;
		}
		wp_safe_redirect( home_url( '/studio/' ) );
		exit;
	}
}

register_activation_hook( __FILE__, array( 'Law100_Studio', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Law100_Studio', 'deactivate' ) );
Law100_Studio::instance();
