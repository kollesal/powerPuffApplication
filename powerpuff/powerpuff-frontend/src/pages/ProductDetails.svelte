<script>
    import axios from "axios";
    import { jwt_token } from "../store";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "http://localhost:8080";

    export let params = {};
    let product_id;
    let user_id;

    
    let allUsers = [];

    $: {
        product_id = params.id;
        getProduct();
        getUsers();
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
        comment: null,
    };

    let productId = {
        productId: product.id,
    };

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
            url: api_root + "/api/users",
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
            })
            .catch(function (error) {
                alert("Could not assign Product to user");
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

<!--<div class="col-md-12">-->
<h1 class="md-3">Product {product.productname}</h1>
<p>ID: {product.id}</p>
<h3>Product Type: {product.productType}</h3>

<div class="md-12">
    <div class="col-md-4">
        <ul class="list-group">
            <li class="list-group-item-top active" aria-current="true">
                Description:
            </li>
            <li class="list-group-item">
                {product.description}
            </li>
        </ul>
    </div>
   
    <div class="col-md-8" />

    <h3>Creator:</h3>

    {#if product.userId === null}
    <div class="row">
                <div class="col-sm-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">
                                No Creator assigned
                            </h5>
                            <p class="card-text">
                            </p>
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

    <div class="col-md-8" />

    {#if product.userId === null}
    <h3>Assign User</h3>
    <label for="member">Add a User to this Product</label>
    <div class="col-md-4">
        <select class="form-select" bind:value={user_id} id="user">
            {#each allUsers as user}
                    <option value={user.id}
                        >{user.username}</option
                    >
            {/each}
        </select>
    </div>
    <div class="col-md-6" />
    <button on:click={productassignment} class="my-button">Assign</button>

{/if}

<div class="col-md-8" />

<h3>Status: {product.productState}</h3>

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

    {#if product.productState === "INACTIVE"}
    <div class="col-md-4">
        <ul class="list-group">
            <li class="list-group-item-top active" aria-current="true">
                Reason for Inactivation:
            </li>
            <li class="list-group-item">
                {product.comment}
            </li>
        </ul>
    </div>
    {/if}


    <div class="col-md-8" />


    {#if $user.user_roles && $user.user_roles.length > 0}
        <a href="#/products" on:click={deleteProduct} class="delete-button"
            >Delete Product</a
        >
        {#if product.productState === "NEW"}
            <a href="#/products" on:click={productReview} class="my-button"
                >Review Product</a
            >
        {:else if product.productState === "REVIEW"}
            <a href="#/products" on:click={productActivation} class="my-button"
                >Activate Product</a
            >
        {:else if product.productState === "ACTIVE"}
            <a href="#/products" on:click={productCompletion} class="my-button"
                >Inactivate Product</a
            >
        {:else if product.productState === "INACTIVE"}
            <a href="#/products" on:click={productActivation} class="my-button"
                >Activate Product</a
            >
        {/if}
    {/if}
    <a class="back-button" href="#/products" role="button" aria-pressed="true"
        >Back</a
    >
    <div class="md-12" />
</div>
