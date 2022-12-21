<script>
    import axios from "axios";
    import { jwt_token } from "../store";
    import { querystring } from "svelte-spa-router";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "https://powerpuff-1671620117973.azurewebsites.net";
    var currentPage;
    let nrOfPages = 0;
    let type;

    let utilities = [];
    let utility = {
        utilityName: null,
        unit: null,
        utilityType: null,
    };

    $: {
        let searchParams = new URLSearchParams($querystring);
        if (searchParams.has("page")) {
            currentPage = searchParams.get("page");
        } else {
            currentPage = "1";
        }
        getUtilities();
    }

    function getUtilities() {
        let query = "pageSize=6&page=" + currentPage;

        if (type) {
            query += "&type=" + type;
        }

        var config = {
            method: "get",
            url: api_root + "/api/utilities?" + query,
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                utilities = response.data.content;
                nrOfPages = response.data.totalPages;
            })
            .catch(function (error) {
                alert("Could not get utilities");
                console.log(error);
            });
    }

    function createUtility() {
        var config = {
            method: "post",
            url: api_root + "/api/utilities",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + $jwt_token
            },
            data: utility,
        };

        axios(config)
            .then(function (response) {
                alert("Utility created");
                getUtilities();
            })
            .catch(function (error) {
                alert("Could not create Utility");
                console.log(error);
            });
    }

    function updateUtility(id, utilityName, unit, utilityType){
        var config = {
            method: "patch",
            url: api_root + "/api/utilities/" + id,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + $jwt_token,
            },
            data: {
                utilityName: utilityName,
                unit: unit,
                utilityType: utilityType,
            },
        };

        axios(config)
            .then(function (response) {
                alert("Utility updated");
                getUtilities();
            })
            .catch(function (error) {
                alert("Could not update Utility");
                console.log(error);
            });
    }

</script>
{#if $isAuthenticated}

<h1 class="mt-3">Create Utility</h1>
<form class="mb-5">
    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="utilityName">Name</label>
            <input
                bind:value={utility.utilityName}
                class="form-control"
                id="description"
                type="text"
            />
        </div>

        <div class="col">
                <label class="form-label" for="unit">Unit</label>
                <input
                    bind:value={utility.unit}
                    class="form-control"
                    id="earnings"
                    type="number"
                />
            </div>

        <div class="col">
            <label class="form-label" for="utilityType"
                >Utility Type</label
            >
            <select
                bind:value={utility.utilityType}
                class="form-select"
                id="type"
                type="text"
            >
                <option value="WRITING">Writing</option>
                <option value="MARKING">Marking</option>
                <option value="CUTTING">Cutting</option>
                <option value="SEWING">Sewing</option>
                <option value="MASCHINE">Maschine</option>
                <option value="FOOT">Foot</option>
                <option value="NEEDLE">Needle</option>
                <option value="ATTACHMENT">Attachment</option>
                <option value="MEASURING">Measuring</option>
                <option value="SECURITY">Security</option>
                <option value="HELP">Help</option>
                <option value="THREAD">Thread</option>
                <option value="PATTERN">Pattern</option>
            </select>
        </div>
    </div>
</form>


<button type="button" class="my-button" on:click={createUtility}>Submit</button>

<div class="row mb-3">
</div>

<div class="row my-3">
{#if $user.user_roles && $user.user_roles.length > 0}
    <div class="col-auto">
        <label for="" class="col-form-label">Utility Type: </label>
    </div>

    <div class="col-3">
        <select
            bind:value={type}
            placeholder="Type"
            class="form-select"
            id="type"
            type="text"
        >
        <option value="WRITING">Writing</option>
        <option value="MARKING">Marking</option>
        <option value="CUTTING">Cutting</option>
        <option value="SEWING">Sewing</option>
        <option value="MASCHINE">Maschine</option>
        <option value="FOOT">Foot</option>
        <option value="NEEDLE">Needle</option>
        <option value="ATTACHMENT">Attachment</option>
        <option value="MEASURING">Measuring</option>
        <option value="SECURITY">Security</option>
        <option value="HELP">Help</option>
        <option value="THREAD">Thread</option>
        <option value="PATTERN">Pattern</option>
        </select>
    </div>
{/if}
<div class="col-auto">
<button class="my-button" on:click={getUtilities}>Apply</button>
</div>
</div>

<h1>All Utilities</h1>

<table class="table table-hover">
    <thead>
        <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Units</th>
            <th>Utility Types</th>
            <th>Update Utility</th>
        </tr>
    </thead>
    <tbody>
        {#each utilities as utility, index}
            <tr
                class="row-tr"
            >
                <td>
                    {index + 1}
                </td>
                <td>
                    {utility.utilityName}
                </td>
                <td>
                    {utility.unit}
                </td>
                <td>
                    {utility.utilityType}
                </td>
                <td>
                    <button
                    type="button"
                    class="my-button"
                    data-bs-toggle="modal"
                    data-bs-target="#user{utility.id}"
                >
                </button>
                </td>
                </tr>

 <!-- Modal -->
 <div
 class="modal fade"
 id="user{utility.id}"
 tabindex="-1"
 role="dialog"
 aria-labelledby="exampleModalLabel"
 aria-hidden="true"
>
 <div class="modal-dialog" role="document">
     <div class="modal-content">
         <div class="modal-header">
             <h5 class="modal-title" id="exampleModalLabel">
                 Update Utility
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
                         for="Name"
                         class="col-sm-2 col-form-label">Name</label
                     >
                     <div class="col-sm-10">
                         <input
                             type="text"
                             class="form-control"
                             id="Name"
                             bind:value={utility.utilityName}
                         />
                     </div>
                 </div>
                 <p></p>
                 <div class="form-group row">
                     <label
                         for="Unit"
                         class="col-sm-2 col-form-label">Unit</label
                     >
                     <div class="col-sm-10">
                         <input
                             type="text"
                             class="form-control"
                             id="Unit"
                             bind:value={utility.unit}
                         />
                     </div>
                 </div>
                 <p></p>
                 <div class="form-group row">
                    <label class="form-label" for="utilityType"
                    >Utility Type</label
                >
                <select
                    bind:value={utility.utilityType}
                    class="form-select"
                    id="type"
                    type="text"
                >
                    <option value="WRITING">Writing</option>
                    <option value="MARKING">Marking</option>
                    <option value="CUTTING">Cutting</option>
                    <option value="SEWING">Sewing</option>
                    <option value="MASCHINE">Maschine</option>
                    <option value="FOOT">Foot</option>
                    <option value="NEEDLE">Needle</option>
                    <option value="ATTACHMENT">Attachment</option>
                    <option value="MEASURING">Measuring</option>
                    <option value="SECURITY">Security</option>
                    <option value="HELP">Help</option>
                    <option value="THREAD">Thread</option>
                    <option value="PATTERN">Pattern</option>
                </select>
             </form>
         </div>
         <div class="modal-footer">
             <button
                 type="button"
                 class="back-button"
                 data-bs-dismiss="modal">Close</button
             >
             <button type="button" class="my-button" data-bs-dismiss="modal" on:click={updateUtility(utility.id, utility.utilityName, utility.unit, utility.utilityType)}
                 >Save changes</button
             >
         </div>
     </div>
 </div>
</div>
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
                    href={"#/utilities?page=" + (i + 1)}
                    >{i + 1}
                </a>
            </li>
        {/each}
    </ul>
</nav>

{:else}
  <div class="alert" role="alert">
    <h3><b>Not logged in</b></h3>
  </div>
{/if}


