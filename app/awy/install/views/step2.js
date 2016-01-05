let str = `
    <div class="row errors">
        <ul class="fa-ul" data-bind="text errors"></ul>
    </div>
    <div class="row">
        <h1>Step 2 of 3: First Admin User</h1>
    </div>
    <div class="row">
        <div class="six columns">
            <label class="required" for="firstname">First Name</label>
            <input type="text" class="required u-full-width" name="firstname" data-bind="value firstname" placeholder="John"/>
        </div>
    </div>
    <div class="row">
        <div class="six columns">
            <label class="required" for="lastname">Last Name</label>
            <input type="text" class="required u-full-width" name="lastname" data-bind="value lastname" placeholder="Doe"/>
        </div>
    </div>
    <div class="row">
        <div class="six columns">
            <label class="required" for="email">Email</label>
            <input type="text" class="required u-full-width" name="email" data-bind="value email" placeholder="email@domain.tld"/>
        </div>
    </div>
    <div class="row">
        <div class="six columns">
            <label class="required" for="username">User Name</label>
            <input type="text" class="required u-full-width" name="username" data-bind="value username" placeholder="admin"/>
        </div>
    </div>
    <div class="row">
        <div class="three columns">
            <label class="required" for="password">Password</label>
            <input type="password" class="required u-full-width" name="password" data-bind="value password" placeholder="******"/>
        </div>
        <div class="three columns">
            <label class="required" for="password_confirm">Confirm Password</label>
            <input type="password" class="required u-full-width" name="password_confirm" data-bind="value password_confirm"/>
        </div>
    </div>
    <div class="row">
        <div class="three columns">
            <button type="submit" class="button-primary" data-bind="click completeStep">Continue</button>
        </div>
    </div>
`;
export default str;