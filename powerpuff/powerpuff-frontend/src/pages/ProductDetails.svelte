<script>
    import axios from "axios";
    import { jwt_token } from "../store";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "https://powerpuff-1671620117973.azurewebsites.net";

    export let params = {};
    let product_id;
    let user_id;
    let utility_id;

    let allUsers = [];
    let allUtilities = [];

    $: {
        product_id = params.id;
        getProduct();

        if ($isAuthenticated) {
            getUsers();
            getUser();
            getUtilities();
        }
    }

    let product = {
        productname: null,
        description: null,
        productType: null,
        difficultyType: null,
        clothingType: null,
        size: null,
        price: null,
        patchart: null,
        userId: null,
        utilityIds: [],
        comment: null,
    };

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
            url: api_root + "/api/users/email/" + $user.email,
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                userper = response.data;
                console.log(userper);
            })
            .catch(function (error) {
                alert("Could not get user");
                console.log(error);
            });
    }

    function getProduct() {
        var config = {
            method: "get",
            url: api_root + "/api/products/" + product_id,
            headers: {},
        };

        axios(config)
            .then(function (response) {
                product = response.data;
            })
            .catch(function (error) {
                alert("Could not get product");
                console.log(error);
            });
    }

    function getUsers() {
        var config = {
            method: "get",
            url: api_root + "/api/users?pageSize=30",
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                allUsers = response.data.content;
                console.log(allUsers.length);
                console.log(allUsers);
            })
            .catch(function (error) {
                alert("Could not get users");
                console.log(error);
            });
    }

    function getUtilities() {
        var config = {
            method: "get",
            url: api_root + "/api/utilities?pageSize=100",
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                allUtilities = response.data.content;
                console.log(allUtilities);
            })
            .catch(function (error) {
                alert("Could not get utilities");
                console.log(error);
            });
    }

    function deleteProduct() {
        var config = {
            method: "delete",
            url: api_root + "/api/products/" + product_id,
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                alert("Product " + product.productname + " deleted");
            })
            .catch(function (error) {
                alert(error);
                console.log(error);
            });
    }

    function productassignment() {
        var config = {
            method: "post",
            url: api_root + "/api/service/productassignment",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                productId: product.id,
                userId: user_id,
            },
        };
        axios(config)
            .then(function (response) {
                alert("Product is assigned to user");
                getProduct();
            })
            .catch(function (error) {
                alert("Could not assign Product to user");
                console.log(error);
            });
    }

    function utilityassignment() {
        var config = {
            method: "post",
            url: api_root + "/api/service/utilityassignment",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                productId: product.id,
                utilityId: utility_id,
            },
        };
        axios(config)
            .then(function (response) {
                alert("Product is assigned to utility");
                getProduct();
            })
            .catch(function (error) {
                alert("Could not assign Product to utility");
                console.log(error);
            });
    }

    function productActivation() {
        var config = {
            method: "post",
            url: api_root + "/api/service/productactivation",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                productId: product.id,
            },
        };
        axios(config)
            .then(function (response) {
                alert("Product activated");
            })
            .catch(function (error) {
                alert("Could not activate Product");
                console.log(error);
            });
    }

    function productReview() {
        var config = {
            method: "post",
            url: api_root + "/api/service/productreview",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                productId: product.id,
            },
        };
        axios(config)
            .then(function (response) {
                alert("Product reviewed");
            })
            .catch(function (error) {
                alert("Could not review Product");
                console.log(error);
            });
    }

    function productCompletion() {
        var config = {
            method: "post",
            url: api_root + "/api/service/productcompletion",
            headers: { Authorization: "Bearer " + $jwt_token },
            data: {
                productId: product.id,
                comment: product.comment,
            },
        };
        axios(config)
            .then(function (response) {
                alert("Product inactivated");
            })
            .catch(function (error) {
                alert("Could not inactivate Product");
                console.log(error);
            });
    }

</script>

{#if $isAuthenticated}
    <!--<div class="col-md-12">-->
    <h1 class="md-3">Product {product.productname}</h1>
    <p>ID: {product.id}</p>
    <h3>Product Type: {product.productType}</h3>
    <div class="col-md-8" />
    <div class="md-12">
        <div class="col-4">
            <ul class="list-group">
                <li class="list-group-item-top active" aria-current="true">
                    Description:
                </li>
                <li class="list-group-item">
                    {product.description}
                </li>
            </ul>
        </div>

        {#if $user.user_roles && $user.user_roles.length > 0}
            {#if $isAuthenticated}
                <div class="col-md-8" />

                <h3 class="md-3">Utilities:</h3>
                <div class="row">
                    {#each product.utilityIds as listUtility}
                        {#each allUtilities as entityUtility}
                            {#if listUtility === entityUtility.id}
                                <div class="col-sm-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h5 class="card-title">
                                                {entityUtility.utilityName}
                                            </h5>
                                            <p class="card-text">
                                                Type: {entityUtility.utilityType}
                                            </p>
                                            <p>
                                                Units: {entityUtility.unit}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {/each}
                </div>
            {/if}
            {#if $user.user_roles.includes("admin") || userper.id === product.userId}
                <label for="member">Add a Utility to this Product</label>
                <div class="col-md-4">
                    <select
                        class="form-select"
                        bind:value={utility_id}
                        id="user"
                    >
                        {#each allUtilities as utility}
                            <option value={utility.id}
                                >{utility.utilityName}</option
                            >
                        {/each}
                    </select>
                </div>
                <div class="col-md-8" />
                <button on:click={utilityassignment} class="my-button"
                    >Assign</button
                >

                <p />
                <p>
                    You cannot find a suiting Utility? Then you can create a new
                    Utility here:
                    <a href="#/utilities">Add Utility</a>
                </p>
            {/if}

            <div class="col-md-8" />

            {#if product.userId === null}
                <h3>Creator:</h3>

                <div class="row">
                    <div class="col-sm-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">No Creator assigned</h5>
                                <p class="card-text" />
                            </div>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="row">
                    {#each allUsers as user}
                        {#if product.userId == user.id}
                            <div class="col-sm-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title">
                                            {user.username}
                                        </h5>
                                        <p class="card-text">
                                            Name: {user.name}
                                        </p>
                                        <p>
                                            Email: {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            {/if}
        {/if}

        <div class="col-md-8" />
        {#if $user.user_roles && $user.user_roles.length > 0}
            {#if $user.user_roles.includes("admin")}
                {#if product.userId === null}
                    <h3>Assign User</h3>
                    <label for="member">Add a User to this Product</label>
                    <div class="col-md-4">
                        <select
                            class="form-select"
                            bind:value={user_id}
                            id="user"
                        >
                            {#each allUsers as user}
                                {#if (user.userType === "SUPPLIER" || user.userType === "ADMIN") && user.userStatus === "ACTIVE"}
                                    <option value={user.id}
                                        >{user.username}</option
                                    >
                                {/if}
                            {/each}
                        </select>
                    </div>
                    <div class="col-md-8" />
                    <button on:click={productassignment} class="my-button"
                        >Assign</button
                    >
                {/if}
            {/if}
        {/if}

        <div class="col-md-8" />

        <h3>Status: {product.productState}</h3>
        {#if $user.user_roles && $user.user_roles.length > 0}
            {#if $user.user_roles.includes("admin") || userper.id === product.userId}
                {#if product.productState === "ACTIVE"}
                    <form>
                        <div class="row mb-3">
                            <div class="col">
                                <label for="comment"
                                    >Comment for Inactivation of Product</label
                                >
                                <textarea
                                    bind:value={product.comment}
                                    class="form-control"
                                    id="comment"
                                    rows="3"
                                />
                            </div>
                        </div>
                    </form>
                {/if}
            {/if}
            {#if product.productState === "INACTIVE"}
                <div class="col-md-4">
                    <ul class="list-group">
                        <li
                            class="list-group-item-top active"
                            aria-current="true"
                        >
                            Reason for Inactivation:
                        </li>
                        <li class="list-group-item">
                            {product.comment}
                        </li>
                    </ul>
                </div>
            {/if}
        {/if}

        <div class="col-md-8" />
        {#if $user.user_roles && $user.user_roles.length > 0}
            {#if $user.user_roles.includes("admin") || userper.id === product.userId}
                <a
                    href="#/products"
                    on:click={deleteProduct}
                    class="delete-button">Delete Product</a
                >
                {#if product.productState === "NEW"}
                    <a
                        href="#/products"
                        on:click={productReview}
                        class="my-button">Review Product</a
                    >
                {:else if product.productState === "REVIEW"}
                    <a
                        href="#/products"
                        on:click={productActivation}
                        class="my-button">Activate Product</a
                    >
                {:else if product.productState === "ACTIVE"}
                    <a
                        href="#/products"
                        on:click={productCompletion}
                        class="my-button">Inactivate Product</a
                    >
                {:else if product.productState === "INACTIVE"}
                    <a
                        href="#/products"
                        on:click={productActivation}
                        class="my-button">Activate Product</a
                    >
                {/if}
            {/if}
        {/if}
        <a
            class="back-button"
            href="#/products"
            role="button"
            aria-pressed="true">Back</a
        >
        <div class="md-12" />
    </div>
{:else}
    <div class="alert" role="alert">
        <h3><b>Not logged in</b></h3>
    </div>
{/if}
