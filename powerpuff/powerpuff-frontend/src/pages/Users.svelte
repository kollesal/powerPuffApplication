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

