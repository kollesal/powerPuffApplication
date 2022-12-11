<!-- <script>
    import axios from "axios";
    import { jwt_token } from "../store";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "http://localhost:8080";

    export let params = {};
    let user_id;

    $: {
        user_id = params.id;
        getUser();
    }

    let userper = {
        username: null,
        name: null,
        email: null,
        userStatus: null,
        userType: null,
    };

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

    function deleteUser() {
        var config = {
            method: "delete",
            url: api_root + "/api/users/" + user_id,
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                alert("User " + userper.username + " deleted");
            })
            .catch(function (error) {
                alert(error);
                console.log(error);
            });
    }

    function userActivation() {
        var config = {
            method: "post",
            url: api_root + "/api/service/useractivation",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                userId: userper.id,
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
                userId: userper.id,
                comment: userper.comment,
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

<h1 class="md-3">User {userper.username}</h1>
<p>ID: {userper.id}</p>
<h3>User Type: {userper.userType}</h3>

<div class="col-md-8" />

<h3>Status: {userper.userStatus}</h3>
<!--
{#if userper.userStatus === "ACTIVE"}
    <form>
        <div class="row mb-3">
            <div class="col">
                <label for="comment">Comment for Inactivation of User</label>
                <textarea
                    bind:value={userper.comment}
                    class="form-control"
                    id="comment"
                    rows="3"
                />
            </div>
        </div>
    </form>
{/if}

{#if userper.userStatus === "INACTIVE"}
    <div class="col-md-4">
        <ul class="list-group">
            <li class="list-group-item-top active" aria-current="true">
                Reason for Inactivation:
            </li>
            <li class="list-group-item">
                {userper.comment}
            </li>
        </ul>
    </div>
{/if}

<div class="col-md-8" />

{#if $user.user_roles && $user.user_roles.length > 0}
    <a href="#/users" on:click={deleteUser} class="delete-button">Delete User</a
    >

    {#if userper.userStatus === "ACTIVE"}
        <a href="#/users" on:click={userCompletion} class="my-button"
            >Inactivate Product</a
        >
    {:else if userper.userStatus === "INACTIVE"}
        <a href="#/users" on:click={userActivation} class="my-button"
            >Activate Product</a
        >
    {/if}
{/if}
<a class="back-button" href="#/products" role="button" aria-pressed="true"
    >Back</a
>
<div class="md-12" />

    -->
 -->