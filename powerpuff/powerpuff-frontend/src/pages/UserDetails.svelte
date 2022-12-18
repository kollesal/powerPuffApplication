<script>
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
            url: api_root + "/api/users/" + user_id,
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                userper = response.data;
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

    function changeUserType() {
        var config = {
            method: "post",
            url: api_root + "/api/service/userchangetype",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                userId: userper.id,
                userType: userper.userType,
            },
        };
        axios(config)
            .then(function (response) {
                alert("User Type Changed");
            })
            .catch(function (error) {
                alert("Could not Change User Type");
                console.log(error);
            });
    }

    function updateUser(){
        var config = {
            method: "put",
            url: api_root + "/api/users/" + user_id,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + $jwt_token,
            },
            data: userper,
        };

        axios(config)
            .then(function (response) {
                alert("User updated");
                getUser();
            })
            .catch(function (error) {
                alert("Could not update User");
                console.log(error);
            });
    }

</script>
{#if $isAuthenticated}

<h1 class="md-3">User {userper.username}</h1>
<p>ID: {userper.id}</p>
<h3>User Name: {userper.name}</h3>
<h3>User Type: {userper.userType}</h3>
<h3>Status: {userper.userStatus}</h3>

<label for="user">Change User Type</label>

<div class="col-md-4">
    <select class="form-select" bind:value={userper.userType} id="user">
        {#if userper.userType === "BUYER"}
            <option value="SUPPLIER">Supplier</option>
            <option value="ADMIN">Admin</option>
        {:else if userper.userType === "SUPPLIER"}
            <option value="BUYER">Buyer</option>
            <option value="ADMIN">Admin</option>
        {:else if userper.userType === "ADMIN"}
            <option value="BUYER">Buyer</option>
            <option value="SUPPLIER">Supplier</option>
        {/if}
    </select>
</div>

<div class="col-md-8" />

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
            <div class="row mb-3" />
            <div class="row mb-3" />
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
            >Inactivate User</a
        >
    {:else if userper.userStatus === "INACTIVE"}
        <a href="#/users" on:click={userActivation} class="my-button"
            >Activate User</a
        >
    {/if}

    <a href="#/users" on:click={changeUserType} class="my-button"
        >Change User Type</a
    >

    <!-- Button trigger modal -->
    <button
        type="button"
        class="my-button"
        data-bs-toggle="modal"
        data-bs-target="#user{userper.id}"
    >
        Update User
    </button>

    <!-- Modal -->
    <div
        class="modal fade"
        id="user{userper.id}"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">
                        Update User
                    </h5>
                    <button
                        type="button"
                        class="close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group row">
                            <label
                                for="Email"
                                class="col-sm-2 col-form-label">Email</label
                            >
                            <div class="col-sm-10">
                                <input
                                    type="text"
                                    class="form-control"
                                    id="Email"
                                    bind:value={userper.email}
                                />
                            </div>
                        </div>
                        <p></p>
                        <div class="form-group row">
                            <label
                                for="Name"
                                class="col-sm-2 col-form-label">Name</label
                            >
                            <div class="col-sm-10">
                                <input
                                    type="text"
                                    class="form-control"
                                    id="Name"
                                    bind:value={userper.name}
                                />
                            </div>
                        </div>
                        <p></p>
                        <div class="form-group row">
                            <label
                                for="Username"
                                class="col-sm-2 col-form-label">Username</label
                            >
                            <div class="col-sm-10">
                                <input
                                    type="text"
                                    class="form-control"
                                    id="Username"
                                    bind:value={userper.username}
                                />
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button
                        type="button"
                        class="back-button"
                        data-bs-dismiss="modal">Close</button
                    >
                    <button type="button" class="my-button" data-bs-dismiss="modal" on:click={updateUser}
                        >Save changes</button
                    >
                </div>
            </div>
        </div>
    </div>
{/if}

<a class="back-button" href="#/users" role="button" aria-pressed="true">Back</a>
<img class="rounded-circle" alt="Svelte Logo" src="images/canvas.jpg" />
<div class="md-12" />


{:else}
  <div class="alert" role="alert">
    <h3><b>Not logged in</b></h3>
  </div>
{/if}