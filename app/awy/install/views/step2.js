let str = `
<div class="panel-heading">
    <h1 class="panel-title">'Step 2 of 3: First Admin User'</h1>
</div>

<div class="form-group">
    <label class="required" for="firstname">First Name</label>
    <div class="text-input">
        <input type="text" class="required" name="firstname" data-bind="value firstname"/>
    </div>
</div>
<div class="form-group">
    <label class="required" for="lastname">Last Name</label>
    <div class="text-input">
        <input type="text" class="required" name="lastname" data-bind="value lastname"/>
    </div>
</div>
<div class="form-group">
    <label class="required" for="email">Email</label>
    <div class="text-input">
        <input type="text" class="required" name="email" data-bind="value email"/>
    </div>
</div>
<div class="form-group">
    <label class="required" for="username">User Name</label>
    <div class="text-input">
        <input type="text" class="required" name="username" data-bind="value username"/>
    </div>
</div>
<div class="form-group">
    <label class="required" for="password">Password</label>
    <div class="text-input">
        <input type="password" class="required" name="password" data-bind="value password"/>
    </div>
</div>
<div class="form-group">
    <label class="required" for="password_confirm">Confirm Password</label>
    <div class="text-input">
        <input type="password" class="required" name="password_confirm" data-bind="value password_confirm"/>
    </div>
</div>
<ul class="list-group list-group-flush">
    <li class="list-group-item clearfix">
        <button type="submit" class="btn btn-primary pull-right" data-bind="click completeStep">Continue</button>
    </li>
</ul>
`;
export default str;