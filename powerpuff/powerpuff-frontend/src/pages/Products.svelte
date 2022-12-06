<script>
    import axios from "axios";
    import { querystring } from "svelte-spa-router";
    import { jwt_token } from "../store";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "http://localhost:8080";

    let currentPage;
    let nrOfPages = 0;

    let pricesMin, pricesMax, type;

    let products = [];
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

    $: {
        let searchParams = new URLSearchParams($querystring);
        if (searchParams.has("page")) {
            currentPage = searchParams.get("page");
        } else {
            currentPage = "1";
        }
        getProducts();
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

        var config = {
            method: "get",
            url: api_root + "/api/products?" + query,
            headers: { Authorization: "Bearer " + $jwt_token },
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

<h1>All Products</h1>
{#if $user.user_roles && $user.user_roles.length > 0}
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
    <div class="col-3" />
</div>

<div class="row my-3">
    <div class="col-auto">
        <label class="form-label" for="producttype">Product Type: </label>
    </div>
    <div class="col-3">
        <select bind:value={type} class="form-select" id="type" type="text">
            <option value="none">No type selected</option>
            <option value="SCHNITTMUSTER" on:click={getProducts}
                >Schnittmuster</option
            >
            <option value="MANUAL" on:click={getProducts}>Manual</option>
        </select>
    </div>
    <div class="col-3" />
    <div class="col-3">
        <button class="btn btn-primary" on:click={getProducts}>Apply</button>
    </div>
</div>

<!-- <button on:click={getProducts}>Schnittmuster</button> -->

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
                                <span class="badge"
                                    >{product.difficultyType}</span
                                >
                            </h5>

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
                                <span class="badge bg-secondary">Active</span>
                                {:else if product.userId === null} 
                                <button
                                type="button"
                               class="btn btn-primary btn-sm"
                                on:click={() => { assignToMe(user.id); }}
                                >
                                Assign to me
                                </button>
                                {/if}
                                

                            <p class="card-text">
                                <small class="text-muted"
                                    >Product Number: {index + 1}</small
                                >
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>

<nav>
    <ul class="pagination">
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
    </ul>
</nav>

{#if $user.user_roles && $user.user_roles.length > 0}
    <a
        class="my-button"
        href="#/create-product"
        role="button"
        aria-pressed="true">Add Product</a
    >
{/if}
<a class="back-button" href="#/" role="button" aria-pressed="true">Back</a>
