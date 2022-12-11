<script>
    import axios from "axios";
    import { querystring } from "svelte-spa-router";
    import { jwt_token} from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "http://localhost:8080";

    let currentPage;
    let nrOfPages = 0;

    let users = [];
    let user = {
        username: null,
        name: null,
        email: null,
    };

    $: {
        let searchParams = new URLSearchParams($querystring);
        if (searchParams.has("page")) {
            currentPage = searchParams.get("page");
        } else {
            currentPage = "1";
        }
        getUsers();
    }

    function getUser() {
        var config = {
            method: "get",
            url: api_root + "/api/products/" + user_id,
            headers: {},
        };

        axios(config)
            .then(function (response) {
                user = response.data;
            })
            .catch(function (error) {
                alert("Could not get user");
                console.log(error);
            });
    }

    function getUsers() {
        let query = "pageSize=6&page=" + currentPage;

        var config = {
            method: "get",
            url: api_root + "/api/users?" + query,
            headers: {Authorization: "Bearer "+$jwt_token},
        };

        axios(config)
            .then(function (response) {
                users = response.data.content;
                nrOfPages = response.data.totalPages;
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
                Authorization: "Bearer " + $jwt_token
            },
            data: user,
        };

        axios(config)
            .then(function (response) {
                alert("User created");
                getUsers();
            })
            .catch(function (error) {
                alert("Could not create User");
                console.log(error);
            });
    }

    function userActivation() {
        var config = {
            method: "post",
            url: api_root + "/api/service/useractivation",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                userId: user.id,
            },
        };
        axios(config)
            .then(function (response) {
                alert("User activated");
            })
            .catch(function (error) {
                alert("Could not activate User");
                console.log(error);
            });
    }

    function userCompletion() {
        var config = {
            method: "post",
            url: api_root + "/api/service/usercompletion",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                userId: user.id,
                comment: user.comment,
            },
        };
        axios(config)
            .then(function (response) {
                alert("User inactivated");
            })
            .catch(function (error) {
                alert("Could not inactivate User");
                console.log(error);
            });
    }

</script>

<h1 class="mt-3">Create User</h1>
<form class="mb-5">
    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="username">Username</label>
            <input
                bind:value={user.username}
                class="form-control"
                id="description"
                type="text"
            />
        </div>

        <div class="col">
            <label class="form-label" for="name">Name</label>
            <input
                bind:value={user.name}
                class="form-control"
                id="description"
                type="text"
            />
        </div>

        <div class="col">
            <label class="form-label" for="email">E-Mail</label>
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
            
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        {#each users as user}
        <tr
        class="row-tr"
        onclick="document.location = '{'#/users/' + user.id}';"
    >
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
       
    </tbody>
</table>

<nav>
    <ul class="pagination">
        {#each Array(nrOfPages) as _, i}
            <li class="page-item">
                <a
                    class="page-link"
                    class:active={currentPage == i + 1}
                    href={"#/users?page=" + (i + 1)}
                    >{i + 1}
                </a>
            </li>
        {/each}
    </ul>
</nav>

