let str = `
<div class="login-container">
	<div class="row errors">
		<ul class="fa-ul" data-bind="text errors"></ul>
	</div>
	<div class="row">
		<h1>Distro Admin</h1>
	</div>
	<div class="row">
    	<div class="u-full-width">
            <label class="required" for="username">User Name or Email</label>
    		<input type="text" class="required u-full-width" name="username" data-bind="value username" placeholder=""/>
    	</div>
    </div>
    <div class="row">
    	<div class="u-full-width">
            <label class="required" for="password">Password</label>
    		<input type="text" class="required u-full-width" name="password" data-bind="value password" placeholder="******"/>
    	</div>
    </div>
    <div class="row">
        <div class="one-half column u-pull-left">
        	<button type="button" class="button long-text-button u-pull-left" data-bind="click forgotPassword">Forgot your password?</button>
        </div>
        <div class="one-half column u-pull-right">
            <button type="button" class="button-primary u-pull-right" data-bind="click signIn">Sign In</button><span class="u-pull-right spinner" data-bind="text spin"></span>
        </div>
    </div>
</div>
`;
export default str;