# Rails Development Patterns for Agent OS

## Context

Ruby on Rails code style standards and patterns for Agent OS projects. This document embodies Rails philosophy: convention over configuration, the majestic monolith, and developer happiness through simplicity. These patterns ensure consistency, security, and maintainability across Rails applications.

**When to reference this document:**
- Reviewing Rails codebases for quality and conventions
- Creating new Rails features or applications
- Refactoring existing Rails code
- Security scanning Rails applications
- Training AI agents on Rails best practices

**Philosophy:** Rails is omakase - it has opinions, and following them leads to better software. Don't fight the framework; embrace its conventions.

## Rails Philosophy & Core Principles

### Convention Over Configuration

Rails makes decisions for you. Accept them. The framework's conventions eliminate thousands of trivial decisions and make codebases immediately familiar to any Rails developer.

**✅ Good - Follow Rails conventions:**
```ruby
# Rails knows how to find User records from users table
class User < ApplicationRecord
  has_many :posts
end

# Rails knows posts belong to users
class Post < ApplicationRecord
  belongs_to :user
end

# Rails knows to look for user_id in posts table
```

**🔴 Bad - Fighting Rails conventions:**
```ruby
# Don't manually configure what Rails already knows
class User < ApplicationRecord
  has_many :posts, class_name: 'Post', foreign_key: 'user_id'
end

# Don't use repository patterns - ActiveRecord IS your repository
class UserRepository
  def find(id)
    User.find(id)  # Pointless abstraction
  end
end
```

### The Majestic Monolith

Start with a monolith. Microservices are for companies with 100+ engineers, not your 5-person team. Rails excels at building comprehensive applications within a single codebase.

**✅ Good - Monolithic Rails application:**
```ruby
# Everything in one Rails app
# - User authentication (Devise)
# - Admin panel (Rails Admin)
# - API endpoints (when needed)
# - Background jobs (Sidekiq)
# - Email sending (Action Mailer)
```

**🔴 Bad - Premature microservices:**
```ruby
# Don't create separate services unnecessarily
# - auth-service (just use Devise in Rails)
# - api-gateway (just use Rails routes)
# - email-service (just use Action Mailer)
```

### Hotwire Over Single Page Apps

Server-side rendering with Turbo and Stimulus provides 90% of SPA benefits without the complexity. Avoid React/Vue unless you have a genuine need for complex client-side state.

**✅ Good - Hotwire approach:**
```ruby
# Controller action with Turbo Stream
def create
  @post = Post.new(post_params)

  respond_to do |format|
    if @post.save
      format.turbo_stream {
        render turbo_stream: [
          turbo_stream.prepend('posts', partial: 'posts/post', locals: { post: @post }),
          turbo_stream.update('post_form', partial: 'posts/form')
        ]
      }
      format.html { redirect_to @post }
    else
      format.turbo_stream {
        render turbo_stream: turbo_stream.replace('post_form', partial: 'posts/form', locals: { post: @post })
      }
      format.html { render :new, status: :unprocessable_entity }
    end
  end
end
```

**🔴 Bad - Unnecessary React/JSON API:**
```ruby
# Don't build JSON APIs when Hotwire suffices
def create
  @post = Post.new(post_params)

  if @post.save
    render json: { post: PostSerializer.new(@post).as_json }, status: :created
  else
    render json: { errors: @post.errors }, status: :unprocessable_entity
  end
end

# Then build separate React app to consume this API - total overkill
```

### Sessions Over JWT Tokens

Use Rails sessions. They're secure, battle-tested, and simple. JWT tokens are for distributed systems, not monolithic Rails apps.

**✅ Good - Rails sessions:**
```ruby
class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to root_path
    else
      flash.now[:alert] = 'Invalid email or password'
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to root_path
  end
end
```

**🔴 Bad - Unnecessary JWT complexity:**
```ruby
# Don't use JWT tokens in a monolithic Rails app
def create
  user = User.find_by(email: params[:email])

  if user&.authenticate(params[:password])
    token = JWT.encode({ user_id: user.id, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base)
    render json: { token: token }  # Now you need to manage token storage, expiry, refresh...
  end
end
```

## File Structure & Naming Conventions

### Standard Rails Directory Structure

Follow Rails conventions. Don't create custom directory structures.

**✅ Good - Standard Rails structure:**
```
app/
├── controllers/
│   ├── application_controller.rb
│   ├── users_controller.rb
│   └── posts_controller.rb
├── models/
│   ├── application_record.rb
│   ├── user.rb
│   └── post.rb
├── views/
│   ├── layouts/
│   │   └── application.html.erb
│   ├── users/
│   │   ├── index.html.erb
│   │   ├── show.html.erb
│   │   └── _user.html.erb
│   └── posts/
│       ├── index.html.erb
│       └── _post.html.erb
├── helpers/
│   ├── application_helper.rb
│   └── users_helper.rb
└── mailers/
    └── user_mailer.rb
```

### Controller Naming

Controllers are plural, inherit from ApplicationController, and follow RESTful conventions.

**✅ Good - RESTful controller naming:**
```ruby
class UsersController < ApplicationController
  # Standard REST actions: index, show, new, create, edit, update, destroy
end

class Admin::UsersController < ApplicationController
  # Namespaced for admin section
end

class Api::V1::UsersController < ApplicationController
  # Versioned API controllers
end
```

**🔴 Bad - Non-RESTful naming:**
```ruby
class UserManager < ApplicationController  # Don't use "Manager", "Handler", "Processor"
end

class GetUsers < ApplicationController  # Don't use verb names
end
```

### Model Naming

Models are singular, inherit from ApplicationRecord, and match table names.

**✅ Good - Model naming:**
```ruby
# app/models/user.rb
class User < ApplicationRecord
end

# app/models/blog_post.rb
class BlogPost < ApplicationRecord
end

# app/models/admin/user.rb
class Admin::User < ApplicationRecord
  # Use class Admin::User pattern, not module Admin
end
```

### Concerns Usage (Use Sparingly)

Concerns are for truly shared behavior across multiple models or controllers. Don't use them to hide complexity.

**✅ Good - Legitimate concern usage:**
```ruby
# app/models/concerns/taggable.rb
module Taggable
  extend ActiveSupport::Concern

  included do
    has_many :taggings, as: :taggable, dependent: :destroy
    has_many :tags, through: :taggings
  end

  def tag_list
    tags.pluck(:name).join(', ')
  end
end

# Used by multiple models: Post, Article, Photo
class Post < ApplicationRecord
  include Taggable
end
```

**🔴 Bad - Hiding complexity in concerns:**
```ruby
# app/models/concerns/user_stuff.rb
module UserStuff  # Vague name, should be in User model
  extend ActiveSupport::Concern

  def do_complex_thing
    # 50 lines of User-specific logic that should just be in User model
  end
end
```

## Model Patterns - Fat Models

Models contain business logic. This is where validation, associations, scopes, and domain methods live.

### Validations

Always validate at the model level. Never trust data from controllers or forms.

**✅ Good - Comprehensive validations:**
```ruby
class User < ApplicationRecord
  # Presence validations
  validates :email, presence: true
  validates :name, presence: true

  # Format validations
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :username, format: { with: /\A[a-zA-Z0-9_]+\z/ }

  # Length validations
  validates :name, length: { minimum: 2, maximum: 100 }
  validates :bio, length: { maximum: 500 }

  # Uniqueness validations (with case insensitivity where appropriate)
  validates :email, uniqueness: { case_sensitive: false }
  validates :username, uniqueness: true

  # Custom validations
  validate :email_domain_allowed

  private

  def email_domain_allowed
    return if email.blank?

    domain = email.split('@').last
    blocked_domains = ['tempmail.com', 'throwaway.email']

    if blocked_domains.include?(domain)
      errors.add(:email, 'domain is not allowed')
    end
  end
end
```

**🔴 Bad - Validation in controllers:**
```ruby
class UsersController < ApplicationController
  def create
    @user = User.new(user_params)

    # Don't validate in controllers!
    if user_params[:email] !~ URI::MailTo::EMAIL_REGEXP
      flash[:alert] = 'Invalid email'
      render :new
      return
    end

    @user.save  # Model has no validations - data integrity at risk
  end
end
```

### Associations

Define all relationships in models. Rails associations are powerful and eliminate SQL boilerplate.

**✅ Good - Proper associations:**
```ruby
class User < ApplicationRecord
  has_many :posts, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :authored_comments, class_name: 'Comment', foreign_key: 'author_id'
  has_one :profile, dependent: :destroy

  # Through associations for many-to-many
  has_many :memberships, dependent: :destroy
  has_many :groups, through: :memberships

  # Polymorphic associations
  has_many :likes, as: :likeable
end

class Post < ApplicationRecord
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_many :commenters, through: :comments, source: :user

  # Counter cache for performance
  belongs_to :user, counter_cache: true
end

class Comment < ApplicationRecord
  belongs_to :post
  belongs_to :user
  belongs_to :author, class_name: 'User', optional: true
end
```

**🔴 Bad - Manual queries instead of associations:**
```ruby
class User < ApplicationRecord
  # Don't write methods that manually query associated records
  def posts
    Post.where(user_id: id)  # Just use has_many :posts
  end

  def post_count
    Post.where(user_id: id).count  # Use counter_cache instead
  end
end
```

### Scopes

Scopes define reusable query fragments. Use them liberally for common queries.

**✅ Good - Useful scopes:**
```ruby
class Post < ApplicationRecord
  # Status scopes
  scope :published, -> { where(status: 'published') }
  scope :draft, -> { where(status: 'draft') }
  scope :archived, -> { where(status: 'archived') }

  # Time-based scopes
  scope :recent, -> { where('created_at > ?', 1.week.ago) }
  scope :today, -> { where(created_at: Date.today.all_day) }

  # Ordering scopes
  scope :by_newest, -> { order(created_at: :desc) }
  scope :by_popularity, -> { order(views_count: :desc) }

  # Parameterized scopes
  scope :by_author, ->(author_id) { where(author_id: author_id) }
  scope :search, ->(query) { where('title ILIKE ? OR body ILIKE ?', "%#{query}%", "%#{query}%") }

  # Chaining scopes is powerful
  # Post.published.recent.by_newest
end
```

**🔴 Bad - Complex queries in controllers:**
```ruby
class PostsController < ApplicationController
  def index
    # Don't build complex queries in controllers
    @posts = Post.where(status: 'published')
                 .where('created_at > ?', 1.week.ago)
                 .order(created_at: :desc)

    # Use scopes instead:
    # @posts = Post.published.recent.by_newest
  end
end
```

### Callbacks (Use with Caution)

Callbacks are powerful but can create hidden complexity. Use them for truly automatic behaviors.

**✅ Good - Appropriate callback usage:**
```ruby
class User < ApplicationRecord
  before_save :downcase_email
  before_create :generate_api_token
  after_create :send_welcome_email
  after_destroy :cleanup_associated_files

  private

  def downcase_email
    self.email = email.downcase if email.present?
  end

  def generate_api_token
    self.api_token = SecureRandom.hex(32)
  end

  def send_welcome_email
    UserMailer.welcome(self).deliver_later
  end

  def cleanup_associated_files
    ProfileImageCleanupJob.perform_later(id)
  end
end
```

**🔴 Bad - Business logic in callbacks:**
```ruby
class Order < ApplicationRecord
  after_save :process_payment  # Don't process payments in callbacks!
  after_create :send_to_warehouse  # Don't send external API calls in callbacks!
  before_destroy :refund_customer  # Destructive actions should be explicit!

  # These should be explicit method calls in controllers or jobs
end
```

## Controller Patterns - Skinny Controllers

Controllers coordinate between models and views. Keep them thin - business logic belongs in models.

### Standard REST Actions

Follow RESTful conventions. Most controllers need only: index, show, new, create, edit, update, destroy.

**✅ Good - Standard RESTful controller:**
```ruby
class PostsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_post, only: [:show, :edit, :update, :destroy]
  before_action :authorize_post, only: [:edit, :update, :destroy]

  def index
    @posts = Post.published.by_newest.page(params[:page])
  end

  def show
    # @post set by before_action
    @comments = @post.comments.by_newest
  end

  def new
    @post = current_user.posts.build
  end

  def create
    @post = current_user.posts.build(post_params)

    if @post.save
      redirect_to @post, notice: 'Post created successfully'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    # @post set by before_action
  end

  def update
    if @post.update(post_params)
      redirect_to @post, notice: 'Post updated successfully'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @post.destroy
    redirect_to posts_path, notice: 'Post deleted successfully'
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def authorize_post
    redirect_to root_path, alert: 'Not authorized' unless @post.user == current_user
  end

  def post_params
    params.require(:post).permit(:title, :body, :status)
  end
end
```

**🔴 Bad - Business logic in controllers:**
```ruby
class PostsController < ApplicationController
  def create
    @post = Post.new(post_params)

    # Don't put business logic in controllers!
    if @post.title.present? && @post.title.length > 5
      if @post.body.present? && @post.body.length > 100
        @post.status = 'published'
        @post.published_at = Time.current

        # Send notifications
        @post.user.followers.each do |follower|
          NotificationMailer.new_post(follower, @post).deliver_later
        end

        # Update statistics
        @post.user.increment!(:posts_count)

        @post.save
      end
    end

    # All of this should be in the model or a service object!
  end
end
```

### Strong Parameters (Security Critical)

Always use strong parameters. Never pass params directly to create or update.

**✅ Good - Proper strong parameters:**
```ruby
class UsersController < ApplicationController
  def create
    @user = User.new(user_params)
    # user_params filters allowed attributes
  end

  def update
    @user = User.find(params[:id])
    @user.update(user_params)
  end

  private

  def user_params
    # Only permit explicitly allowed attributes
    params.require(:user).permit(:name, :email, :bio, :avatar)
  end
end

# For nested attributes
class PostsController < ApplicationController
  private

  def post_params
    params.require(:post).permit(
      :title,
      :body,
      :status,
      tag_ids: [],
      comments_attributes: [:id, :body, :_destroy]
    )
  end
end

# For admin-only attributes
class Admin::UsersController < ApplicationController
  private

  def user_params
    params.require(:user).permit(:name, :email, :bio, :avatar, :role, :admin)
    # Admin controller can permit sensitive attributes
  end
end
```

**🔴 Bad - Security vulnerability (mass assignment):**
```ruby
class UsersController < ApplicationController
  def create
    # NEVER DO THIS - Mass assignment vulnerability!
    @user = User.new(params[:user])
    # Attacker can set any attribute: { user: { role: 'admin', banned: false } }
  end

  def update
    @user = User.find(params[:id])
    # NEVER DO THIS
    @user.update(params[:user])
  end
end
```

### Turbo Streams in Controllers

For simple Turbo Stream responses, use inline arrays. Don't create separate template files unless the response is complex.

**✅ Good - Inline Turbo Streams:**
```ruby
class CommentsController < ApplicationController
  def create
    @comment = @post.comments.build(comment_params)
    @comment.user = current_user

    if @comment.save
      render turbo_stream: [
        turbo_stream.prepend('comments', partial: 'comments/comment', locals: { comment: @comment }),
        turbo_stream.update('comment_form', partial: 'comments/form', locals: { post: @post, comment: @post.comments.build })
      ]
    else
      render turbo_stream: turbo_stream.replace('comment_form', partial: 'comments/form', locals: { post: @post, comment: @comment })
    end
  end

  def destroy
    @comment = Comment.find(params[:id])
    @comment.destroy

    render turbo_stream: turbo_stream.remove(@comment)
  end
end
```

**🔴 Bad - Separate template files for simple streams:**
```ruby
# Don't create app/views/comments/create.turbo_stream.erb for simple operations
<%= turbo_stream.prepend 'comments', partial: 'comments/comment', locals: { comment: @comment } %>
<%= turbo_stream.update 'comment_form', partial: 'comments/form' %>

# Just use inline arrays in the controller instead (see above)
```

## View Patterns - Hotwire First

### Turbo Frames

Use Turbo Frames for partial page updates without JavaScript.

**✅ Good - Turbo Frame usage:**
```erb
<!-- app/views/posts/show.html.erb -->
<div class="post">
  <h1><%= @post.title %></h1>
  <p><%= @post.body %></p>

  <%= turbo_frame_tag 'comments' do %>
    <%= render @post.comments %>
    <%= render 'comments/form', post: @post, comment: @post.comments.build %>
  <% end %>
</div>

<!-- app/views/comments/_form.html.erb -->
<%= form_with model: [post, comment], id: 'comment_form' do |f| %>
  <%= f.text_area :body %>
  <%= f.submit 'Post Comment' %>
<% end %>

<!-- Submission stays within turbo_frame, no page reload -->
```

### Partials Organization

Use partials for reusable view components. Follow naming convention: `_partial_name.html.erb`.

**✅ Good - Partial usage:**
```erb
<!-- app/views/posts/_post.html.erb -->
<div id="<%= dom_id(post) %>" class="post">
  <h2><%= link_to post.title, post %></h2>
  <p><%= truncate(post.body, length: 200) %></p>
  <div class="meta">
    Posted by <%= post.user.name %> on <%= post.created_at.to_s(:long) %>
  </div>
</div>

<!-- app/views/posts/index.html.erb -->
<div id="posts">
  <%= render @posts %>
</div>
```

### Helpers

Use helpers for view logic. Keep views clean and focused on presentation.

**✅ Good - Helper usage:**
```ruby
# app/helpers/application_helper.rb
module ApplicationHelper
  def formatted_date(date)
    return 'Never' if date.nil?
    date.strftime('%B %d, %Y')
  end

  def user_avatar(user, size: 40)
    if user.avatar.attached?
      image_tag user.avatar, size: "#{size}x#{size}", class: 'avatar'
    else
      image_tag "default-avatar.png", size: "#{size}x#{size}", class: 'avatar'
    end
  end

  def post_status_badge(post)
    case post.status
    when 'published'
      content_tag :span, 'Published', class: 'badge badge-success'
    when 'draft'
      content_tag :span, 'Draft', class: 'badge badge-warning'
    else
      content_tag :span, post.status.titleize, class: 'badge badge-secondary'
    end
  end
end

# app/views/posts/_post.html.erb
<div class="post">
  <h2><%= post.title %> <%= post_status_badge(post) %></h2>
  <div class="meta">
    <%= user_avatar(post.user, size: 30) %>
    <%= formatted_date(post.published_at) %>
  </div>
</div>
```

**🔴 Bad - Complex logic in views:**
```erb
<!-- Don't do complex logic in views -->
<div class="post">
  <h2><%= post.title %>
    <% if post.status == 'published' %>
      <span class="badge badge-success">Published</span>
    <% elsif post.status == 'draft' %>
      <span class="badge badge-warning">Draft</span>
    <% else %>
      <span class="badge badge-secondary"><%= post.status.titleize %></span>
    <% end %>
  </h2>
  <!-- Use helpers instead! -->
</div>
```

## Service Objects - Use Rarely

Service objects are for complex multi-model operations. Don't create them for simple CRUD. Kieran's rule: "I'd rather have four controllers with simple actions than three controllers that are all custom and have very complex things."

### When to Use Service Objects

Only extract to a service when you see MULTIPLE of these signals:
- Complex business rules (not just "it's long")
- Multiple models being orchestrated together
- External API interactions or complex I/O
- Logic you'd want to reuse across controllers

**✅ Good - Legitimate service object:**
```ruby
# app/services/order_fulfillment_service.rb
class OrderFulfillmentService
  def initialize(order)
    @order = order
  end

  def fulfill
    ActiveRecord::Base.transaction do
      # Multiple models orchestrated together
      @order.update!(status: 'fulfilled', fulfilled_at: Time.current)
      @order.items.each { |item| item.product.decrement!(:stock) }

      # External API call
      ShippingProvider.create_shipment(@order)

      # Notifications
      OrderMailer.fulfillment_confirmation(@order).deliver_later

      # Analytics
      AnalyticsTracker.track('order_fulfilled', order_id: @order.id)
    end
  rescue ShippingProvider::Error => e
    @order.update(status: 'fulfillment_failed', error_message: e.message)
    false
  end
end

# Used in controller
class OrdersController < ApplicationController
  def fulfill
    @order = Order.find(params[:id])

    if OrderFulfillmentService.new(@order).fulfill
      redirect_to @order, notice: 'Order fulfilled successfully'
    else
      redirect_to @order, alert: 'Fulfillment failed'
    end
  end
end
```

**🔴 Bad - Unnecessary service object:**
```ruby
# app/services/user_creation_service.rb
class UserCreationService
  # This is just User.create - no service needed!
  def create(params)
    User.create(params)
  end
end

# app/services/post_publisher_service.rb
class PostPublisherService
  # This should just be a method on Post model
  def publish(post)
    post.update(status: 'published', published_at: Time.current)
  end
end

# Just do this in the model:
class Post < ApplicationRecord
  def publish!
    update!(status: 'published', published_at: Time.current)
  end
end
```

## Security Patterns

### SQL Injection Prevention

Always use parameterized queries. Never interpolate user input into SQL strings.

**✅ Good - Safe queries:**
```ruby
# Safe - parameterized query
User.where('email = ?', params[:email])
User.where(email: params[:email])
User.find_by(email: params[:email])

# Safe - ActiveRecord conditions
Post.where(status: params[:status])
Post.where('created_at > ?', params[:start_date])

# Safe - named placeholders
User.where('email = :email AND age > :age', email: params[:email], age: params[:age])
```

**🔴 Bad - SQL injection vulnerability:**
```ruby
# NEVER INTERPOLATE USER INPUT!
User.where("email = '#{params[:email]}'")  # SQL injection!
Post.where("title LIKE '%#{params[:query]}%'")  # SQL injection!

# Attacker can input: "' OR '1'='1" to bypass authentication
user = User.where("email = '#{params[:email]}'").first
```

### Cross-Site Scripting (XSS) Prevention

ERB automatically escapes HTML by default. Never use `html_safe` or `raw` with user input.

**✅ Good - Automatic escaping:**
```erb
<!-- Automatically escaped by ERB -->
<p><%= @post.title %></p>
<p><%= @comment.body %></p>

<!-- For HTML you control and trust -->
<%= simple_format(@post.body) %>  <!-- simple_format is safe -->
<%= sanitize(@post.body, tags: %w[p b i strong em]) %>  <!-- sanitize with whitelist -->
```

**🔴 Bad - XSS vulnerability:**
```erb
<!-- NEVER DO THIS with user input -->
<p><%= raw @post.title %></p>
<p><%= @comment.body.html_safe %></p>

<!-- Attacker can inject: <script>alert('XSS')</script> -->
```

### Authentication & Authorization

Use Devise for authentication. Implement authorization with Pundit or simple methods.

**✅ Good - Authorization pattern:**
```ruby
class ApplicationController < ActionController::Base
  private

  def authenticate_user!
    redirect_to login_path, alert: 'Please log in' unless current_user
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
  helper_method :current_user
end

class PostsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :authorize_post_owner!, only: [:edit, :update, :destroy]

  private

  def authorize_post_owner!
    @post = Post.find(params[:id])
    redirect_to root_path, alert: 'Not authorized' unless @post.user == current_user
  end
end
```

## Testing Patterns

### Model Tests

Test validations, associations, scopes, and business logic.

**✅ Good - Comprehensive model tests:**
```ruby
# test/models/user_test.rb
require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'valid user' do
    user = User.new(name: 'John Doe', email: 'john@example.com', password: 'password123')
    assert user.valid?
  end

  test 'invalid without email' do
    user = User.new(name: 'John Doe')
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test 'email must be unique' do
    User.create!(name: 'John', email: 'john@example.com', password: 'password')
    duplicate = User.new(name: 'Jane', email: 'john@example.com', password: 'password')
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], 'has already been taken'
  end

  test 'has many posts' do
    user = users(:john)
    assert_respond_to user, :posts
    assert_kind_of ActiveRecord::Associations::CollectionProxy, user.posts
  end

  test '#published_posts returns only published posts' do
    user = users(:john)
    published = user.posts.create!(title: 'Published', status: 'published')
    draft = user.posts.create!(title: 'Draft', status: 'draft')

    assert_includes user.published_posts, published
    assert_not_includes user.published_posts, draft
  end
end
```

### Controller Tests

Test HTTP responses, redirects, and side effects. Don't test implementation details.

**✅ Good - Controller tests:**
```ruby
# test/controllers/posts_controller_test.rb
require 'test_helper'

class PostsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:john)
    @post = posts(:published_post)
  end

  test 'should get index' do
    get posts_url
    assert_response :success
    assert_select 'h1', 'Posts'
  end

  test 'should show post' do
    get post_url(@post)
    assert_response :success
    assert_select 'h1', @post.title
  end

  test 'should create post when authenticated' do
    sign_in @user

    assert_difference 'Post.count', 1 do
      post posts_url, params: { post: { title: 'New Post', body: 'Content' } }
    end

    assert_redirected_to post_url(Post.last)
    assert_equal 'Post created successfully', flash[:notice]
  end

  test 'should not create post without authentication' do
    assert_no_difference 'Post.count' do
      post posts_url, params: { post: { title: 'New Post', body: 'Content' } }
    end

    assert_redirected_to login_url
  end

  test 'should update own post' do
    sign_in @post.user

    patch post_url(@post), params: { post: { title: 'Updated Title' } }

    assert_redirected_to post_url(@post)
    assert_equal 'Updated Title', @post.reload.title
  end

  test 'should not update other user post' do
    other_user = users(:jane)
    sign_in other_user

    patch post_url(@post), params: { post: { title: 'Hacked' } }

    assert_redirected_to root_url
    assert_not_equal 'Hacked', @post.reload.title
  end
end
```

### System Tests

Test full user workflows with browser automation.

**✅ Good - System test:**
```ruby
# test/system/posts_test.rb
require 'application_system_test_case'

class PostsTest < ApplicationSystemTestCase
  test 'creating a post' do
    user = users(:john)
    login_as user

    visit posts_path
    click_on 'New Post'

    fill_in 'Title', with: 'My System Test Post'
    fill_in 'Body', with: 'This is the post content'
    click_on 'Create Post'

    assert_text 'Post created successfully'
    assert_text 'My System Test Post'
  end

  test 'commenting on a post with Turbo' do
    user = users(:john)
    post = posts(:published_post)
    login_as user

    visit post_path(post)

    within '#comment_form' do
      fill_in 'Comment', with: 'Great post!'
      click_on 'Post Comment'
    end

    # Comment appears without page reload (Turbo Frame)
    within '#comments' do
      assert_text 'Great post!'
    end
  end
end
```

## Performance Patterns

### N+1 Query Prevention

Use `includes`, `preload`, or `eager_load` to avoid N+1 queries.

**✅ Good - Eager loading:**
```ruby
# Bad - N+1 query
@posts = Post.all
@posts.each do |post|
  puts post.user.name  # Triggers separate query for each post
end

# Good - Eager load with includes
@posts = Post.includes(:user).all
@posts.each do |post|
  puts post.user.name  # User already loaded
end

# For nested associations
@posts = Post.includes(:user, comments: :user).all

# For multiple associations
@users = User.includes(:posts, :comments, :profile).all
```

### Caching

Use fragment caching for expensive views and Russian Doll caching for nested partials.

**✅ Good - Fragment caching:**
```erb
<!-- app/views/posts/_post.html.erb -->
<% cache post do %>
  <div class="post">
    <h2><%= post.title %></h2>
    <p><%= post.body %></p>

    <% cache ['comments', post] do %>
      <%= render post.comments %>
    <% end %>
  </div>
<% end %>
```

### Database Indexing

Add indexes for foreign keys and frequently queried columns.

**✅ Good - Proper indexing:**
```ruby
class AddIndexesToPosts < ActiveRecord::Migration[7.0]
  def change
    # Foreign key indexes
    add_index :posts, :user_id
    add_index :comments, :post_id
    add_index :comments, :user_id

    # Frequently queried columns
    add_index :posts, :status
    add_index :posts, :published_at

    # Composite indexes for common queries
    add_index :posts, [:user_id, :created_at]
    add_index :posts, [:status, :published_at]

    # Unique indexes
    add_index :users, :email, unique: true
  end
end
```

## Database Migration Patterns

### Migration Best Practices

Keep migrations reversible and atomic.

**✅ Good - Reversible migration:**
```ruby
class CreatePosts < ActiveRecord::Migration[7.0]
  def change
    create_table :posts do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :body
      t.string :status, default: 'draft', null: false
      t.integer :views_count, default: 0, null: false
      t.datetime :published_at

      t.timestamps
    end

    add_index :posts, :status
    add_index :posts, :published_at
  end
end
```

**✅ Good - Data migration (separate from schema):**
```ruby
class BackfillPostsPublishedAt < ActiveRecord::Migration[7.0]
  def up
    Post.where(status: 'published', published_at: nil).find_each do |post|
      post.update_column(:published_at, post.created_at)
    end
  end

  def down
    # Usually no need to reverse data migrations
  end
end
```

## Anti-Patterns to Avoid

### Over-Engineering

Don't add complexity for imaginary future requirements.

**🔴 Bad - Premature abstraction:**
```ruby
# Don't create abstract factories for simple models
class UserFactory
  def self.create_user(type:, **attributes)
    case type
    when :admin
      AdminUser.new(attributes)
    when :customer
      CustomerUser.new(attributes)
    else
      User.new(attributes)
    end
  end
end

# Just use User.create! - Rails already handles this
```

### JavaScript Framework Contamination

Don't bring React/Redux patterns into Rails.

**🔴 Bad - Redux-style state management:**
```javascript
// Don't do this in Rails
const store = createStore(reducer);
store.dispatch({ type: 'ADD_POST', payload: post });

// Use Hotwire Turbo Streams instead
```

### Unnecessary Background Jobs

Don't queue everything. Some things can run synchronously.

**🔴 Bad - Over-use of background jobs:**
```ruby
# Don't queue simple operations
class PostsController < ApplicationController
  def create
    @post = current_user.posts.build(post_params)
    CreatePostJob.perform_later(@post)  # Unnecessary!
  end
end

# Just save it synchronously
@post = current_user.posts.create(post_params)
```

**✅ Good - Background jobs for slow operations:**
```ruby
# Use background jobs for truly slow operations
class ImportController < ApplicationController
  def create
    CsvImportJob.perform_later(params[:file].path, current_user.id)
    redirect_to imports_path, notice: 'Import started'
  end
end
```

## References & Resources

- [Rails Doctrine](https://rubyonrails.org/doctrine) - Rails philosophy
- [Hotwire](https://hotwired.dev/) - Modern Rails frontend approach
- [Rails Guides](https://guides.rubyonrails.org/) - Official Rails documentation
- [Rails Security Guide](https://guides.rubyonrails.org/security.html) - Security best practices
