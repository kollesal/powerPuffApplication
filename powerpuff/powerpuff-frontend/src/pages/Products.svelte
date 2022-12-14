<script>
    import axios from "axios";
    import { querystring } from "svelte-spa-router";
    import { each } from "svelte/internal";
    import { jwt_token } from "../store";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "http://localhost:8080";
    var currentPage;
    let nrOfPages = 0;

    let pricesMin, pricesMax, type, user_id;
    let state = "ACTIVE";

    let products = [];
    let allUsers = [];

    $: {
        let searchParams = new URLSearchParams($querystring);
        if (searchParams.has("page")) {
            currentPage = searchParams.get("page");
        } else {
            currentPage = "1";
        }
        getProducts();
        getUsers();
    }

    function getProducts() {
        let query = "pageSize=6&page=" + currentPage;

        if (pricesMin) {
            query += "&min=" + pricesMin;
        }
        if (pricesMax) {
            query += "&max=" + pricesMax;
        }
        if (type) {
            query += "&type=" + type;
        }
        if (user_id) {
            query += "&user=" + user_id;
        }
        if (state) {
            query += "&state=" + state;
        }

        var config = {
            method: "get",
            url: api_root + "/api/products?" + query,
            headers: {},
        };

        axios(config)
            .then(function (response) {
                products = response.data.content;
                nrOfPages = response.data.totalPages;
            })
            .catch(function (error) {
                alert("Could not get products");
                console.log(error);
            });
    }

    function getUsers() {
        var config = {
            method: "get",
            url: api_root + "/api/users?pagesize=30",
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                allUsers = response.data.content;
                console.log(allUsers);
            })
            .catch(function (error) {
               // alert("Could not get users");
                console.log(error);
            });
    }

    function assignToMe(productId) {
        var config = {
            method: "post",
            url: api_root + "/api/service/assigntome?productId=" + productId,
            headers: { Authorization: "Bearer " + $jwt_token },
        };
        axios(config)
            .then(function (response) {
                getProducts();
            })
            .catch(function (error) {
                alert("Could not assign product to me");
                console.log(error);
            });
    }
</script>

<h1 class="mt-3">All Products</h1>
{#if !$user.user_roles.includes("buyer")}
    <a
        class="my-button"
        href="#/create-product"
        role="button"
        aria-pressed="true">Add Product</a
    >
{/if}
<a class="back-button" href="#/" role="button" aria-pressed="true">Back</a>

<div class="row my-3">
    <div class="col-auto">
        <label for="" class="col-form-label">Price: </label>
    </div>
    <div class="col-3">
        <input
            class="form-control"
            type="number"
            placeholder="from"
            bind:value={pricesMin}
        />
    </div>
    <div class="col-3">
        <input
            class="form-control"
            type="number"
            placeholder="to"
            bind:value={pricesMax}
        />
    </div>
    {#if $user.user_roles && $user.user_roles.length > 0}
        <div class="col-auto">
            <label for="" class="col-form-label">Creator: </label>
        </div>
        <div class="col-3">
            <select
                bind:value={user_id}
                placeholder="Creator"
                class="form-select"
                id="id"
                type="text"
            >
                {#each allUsers as user}
                    {#if user.userType !== "BUYER" && user.userStatus === "ACTIVE"}
                        <option value={user.id}>{user.username}</option>
                    {/if}
                {/each}

                <!--            <option value=null>No Creator defined</option> -->
            </select>
        </div>
    {/if}
</div>

<div class="row my-3">
    <div class="col-auto">
        <label for="" class="col-form-label">Product Type: </label>
    </div>
    <div class="col-3">
        <div class="form-check">
            <label>
                <input
                    class="form-check-input"
                    bind:group={type}
                    on:click={getProducts}
                    type="radio"
                    name="schittmuster"
                    value="SCHNITTMUSTER"
                />
                Schnittmuster
            </label>
        </div>
        <div class="form-check">
            <label>
                <input
                    class="form-check-input"
                    bind:group={type}
                    on:click={getProducts}
                    type="radio"
                    name="manual"
                    id="manual"
                    value="MANUAL"
                />
                Manual
            </label>
        </div>
    </div>

    {#if $user.user_roles.includes("admin")}
        <div class="col-auto">
            <label for="" class="col-form-label">Product State: </label>
        </div>

        <div class="col-3">
            <select
                bind:value={state}
                placeholder="State"
                class="form-select"
                id="state"
                type="text"
            >

                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="NEW">New</option>
                        <option value="REVIEW">Review</option>

            </select>
        </div>
    {/if}
    <div class="col-auto">
        <button class="my-button" on:click={getProducts}>Apply</button>
    </div>
</div>

<div class="row row-cols-1 row-cols-md-3 g-4">
    {#each products as product, index}
        <div class="container">
            <div class="col-10">
                <div class="card mb-2">
                    <div
                        class="card"
                        onclick="document.location = '{'#/products/' +
                            product.id}';"
                    >
                        <!-- svelte-ignore a11y-img-redundant-alt -->
                        <img
                            class="card-img-top"
                            src="/images/default.png"
                            alt="Card image cap"
                        />
                        <div class="card-body">
                            <h5 class="card-title">
                                {product.productname}
                            </h5>

                            <p class="card-title">
                                <span class="badge bg-primary"
                                    >{product.difficultyType}</span
                                >
                            </p>

                            <p class="card-text" />
                            <p>
                                Product Type: {product.productType}
                            </p>
                            <p>
                                Clothing Type: {product.clothingType}
                            </p>

                            <p>
                                Product Price: {product.price}
                            </p>

                            <p>
                                Product Size: {product.size}
                            </p>

                            {#if product.productState === "ACTIVE"}
                                <p>
                                    <span class="badge bg-success"
                                        >{product.productState}</span
                                    >
                                </p>
                            {:else if product.productState === "REVIEW" || product.productState === "NEW"}
                                <p>
                                    <span class="badge bg-warning"
                                        >{product.productState}</span
                                    >
                                </p>
                            {:else if product.productState === "INACTIVE"}
                                <p>
                                    <span class="badge bg-secondary"
                                        >{product.productState}</span
                                    >
                                </p>
                            {/if}
                            {#if $user.user_roles && $user.user_roles.length > 0}
                                {#if product.userId === null}
                                    <p>
                                        <button
                                            type="button"
                                            class="btn btn-primary btn-sm"
                                            on:click={() => {
                                                assignToMe(product.id);
                                            }}
                                        >
                                            Assign to me
                                        </button>
                                    </p>
                                {/if}
                            {/if}
                            {#if product.userId !== null}
                                <p class="card-text">
                                    {#each allUsers as user}
                                        {#if product.userId === user.id}
                                            <small class="text-muted"
                                                >Creator: {user.username}</small
                                            >
                                        {/if}
                                    {/each}
                                </p>
                            {:else}
                                <p class="card-text">
                                    <small class="text-muted"
                                        >Creator: No Creator defined</small
                                    >
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>

<nav>
    <ul class="pagination">
        <li class="page-item">
            <a class="page-link" href={"#/products?page=" + (currentPage - 1)}
                >Previous</a
            >
        </li>
        {#each Array(nrOfPages) as _, i}
            <li class="page-item">
                <a
                    class="page-link"
                    class:active={currentPage == i + 1}
                    href={"#/products?page=" + (i + 1)}
                    >{i + 1}
                </a>
            </li>
        {/each}
        <li class="page-item">
            <a class="page-link" href={"#/products?page=" + (currentPage + 1)}
                >Next</a
            >
        </li>
    </ul>
</nav>

{#if !$user.user_roles.includes("buyer")}
    <a
        class="my-button"
        href="#/create-product"
        role="button"
        aria-pressed="true">Add Product</a
    >
{/if}
<a class="back-button" href="#/" role="button" aria-pressed="true">Back</a>
