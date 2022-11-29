<script>
    import axios from "axios";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "https://f24530a0-2bc4-4ab0-9f43-d44c45c239b5.mock.pstmn.io";

    let users = [];
    let user = {
        email: null,
        username: null,
        name: null,
    };

    function getUsers() {
        var config = {
            method: "get",
            url: api_root + "/api/users",
            headers: {},
        };

        axios(config)
            .then(function (response) {
                users = response.data;
            })
            .catch(function (error) {
                alert("Could not get users");
                console.log(error);
            });
    }

    function createUser() {
        var config = {
            method: "post",
            url: api_root + "/api/users",
            headers: {
                "Content-Type": "application/json",
            },
            data: user,
        };

        axios(config)
            .then(function (response) {
                alert("Product created");
                getUsers();
            })
            .catch(function (error) {
                alert("Could not create User");
                console.log(error);
            });
    }

    getUsers();

</script>

<h1 class="mt-3">Create User</h1>
<form class="mb-5">
    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="productname">Username</label>
            <input
                bind:value={user.username}
                class="form-control"
                id="description"
                type="text"
            />
        </div>

        <div class="col">
            <label class="form-label" for="productname">Name</label>
            <input
                bind:value={user.name}
                class="form-control"
                id="description"
                type="text"
            />
        </div>

        <div class="col">
            <label class="form-label" for="productname">Username</label>
            <input
                bind:value={user.email}
                class="form-control"
                id="description"
                type="text"
            />
        </div>
    </div>
</form>


<button type="button" class="my-button" on:click={createUser}
    >Submit</button
>

<div class="row mb-3">
</div>

<h1>All Users</h1>

<table class="table table-hover">
    <thead>
        <tr>
            <th>Number</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        {#each users as user, index}
            <tr
                class="row-tr"
                onclick="document.location = '{'#/users/' + user._id}';"
            >
                <td>
                    {index + 1}
                </td>
                <td>
                    {user.username}
                </td>
                <td>
                    {user.name}
                </td>
                <td>
                    {user.email}
                </td>
                <td>
                    {user.userType}
                </td>
                <td>
                    {user.userStatus}
                </td>
            </tr>
        {/each}
        <tr>
            <dt>
                Number of Products: {users.length}
            </dt>
        </tr>
    </tbody>
</table>

