<script>
  import axios from "axios";
  import { jwt_token } from "../store";
  import { isAuthenticated, user } from "../store";

  const api_root = "https://powerpuff-1671620117973.azurewebsites.net";

  export let params = {};
  let user_id;

  $: {
    user_id = params.id;
    getUser();
  }

   let userVariables = [];
   let type;

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
        userVariables = response.data;
                userper = userVariables;
                console.log(userper);

      })
      .catch(function (error) {
        alert("Could not get user");
        console.log(error);
      });
  }

  function updateUser() {
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

  function changeUserType(type) {
    var config = {
      method: "post",
      url: api_root + "/api/service/userchangetype",
      headers: { Authorization: "Bearer " + $jwt_token },
      data: {
        userId: userper.id,
        userType: type,
      },
    };
    axios(config)
      .then(function (response) {
        alert("Application for User Type Supplier successfully submitted.");
        getUser();
      })
      .catch(function (error) {
        alert("Could not Change User Type");
        console.log(error);
      });
  }
</script>

{#if $isAuthenticated}
  <div class="container">
    <div class="main-body">
      <div class="row gutters-sm">
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex flex-column align-items-center text-center">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img
                  class="rounded-circle"
                  src="/images/profilep.jpg"
                  alt="Admin"
                  width="150"
                />

                <div class="mt-3">
                  <h4>{$user.name}</h4>
                  <p class="text-secondary mb-1">{$user.user_roles}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card mb-3">
            <div class="card-body">
              <div class="row">
                <div class="col-sm-3">
                  <h6 class="mb-0">Username</h6>
                </div>
                <div class="col-sm-9 text-secondary">
                  <p>{$user.nickname}</p>
                </div>
              </div>
              <hr />
              <div class="row">
                <div class="col-sm-3">
                  <h6 class="mb-0">Email</h6>
                </div>
                <div class="col-sm-9 text-secondary">
                  {$user.email}
                </div>
              </div>
              <hr />
              <div class="row">
                <div class="col-sm-3">
                  <h6 class="mb-0">User Status</h6>
                </div>
                <div class="col-sm-9 text-secondary">
                  <p>{userVariables.userStatus}</p>
                </div>
              </div>
              <hr />
              <!-- Show roles only if user has at least one role -->
              {#if $user.user_roles && $user.user_roles.length > 0}
                <div class="row">
                  <div class="col-sm-3">
                    <h6 class="mb-0">Roles:</h6>
                  </div>
                  <div class="col-sm-9 text-secondary">
                    <p>{$user.user_roles}</p>
                  </div>
                </div>
              {/if}
              <hr />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Button trigger modal -->
  <button
    type="button"
    class="my-button"
    data-bs-toggle="modal"
    data-bs-target="#user{userper.id}"
  >
    Update User
  </button>
  {#if userper.userType === "BUYER"}
    <button
      type="button"
      class="my-button"
      data-bs-toggle="modal"
      data-bs-target="#application"
    >
      Apply for Supplier Access
    </button>
    {:else if userper.userType === "APPLICATION"}

    <button class="back-button">
      Applied for Role Supplier
    </button>
  {/if} 


  <!-- Modal Update User-->
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
          <h5 class="modal-title" id="exampleModalLabel">Update User</h5>
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
              <label for="Email" class="col-sm-2 col-form-label">Email</label>
              <div class="col-sm-10">
                <input
                  type="text"
                  class="form-control"
                  id="Email"
                  bind:value={userper.email}
                />
              </div>
            </div>
            <p />
            <div class="form-group row">
              <label for="Name" class="col-sm-2 col-form-label">Name</label>
              <div class="col-sm-10">
                <input
                  type="text"
                  class="form-control"
                  id="Name"
                  bind:value={userper.name}
                />
              </div>
            </div>
            <p />
            <div class="form-group row">
              <label for="Username" class="col-sm-2 col-form-label"
                >Username</label
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
          <button type="button" class="back-button" data-bs-dismiss="modal"
            >Close</button
          >
          <button
            type="button"
            class="my-button"
            data-bs-dismiss="modal"
            on:click={updateUser}>Save changes</button
          >
        </div>
      </div>
    </div>
  </div>

   <!-- Modal Assignment-->
   <div
   class="modal fade"
   id="application"
   tabindex="-1"
   role="dialog"
   aria-labelledby="exampleModalLabel"
   aria-hidden="true"
 >
   <div class="modal-dialog" role="document">
     <div class="modal-content">
       <div class="modal-header">
         <h5 class="modal-title" id="exampleModalLabel">Apply for Role Supplier</h5>
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
            <div class="col-6">
             <label for="userType" class="col-form-label">Apply for Usertype</label>
             </div>
              <div class="col-6">
                <select
                    bind:value={type}
                    placeholder="Supplier"
                    class="form-select"
                    id="state"
                    type="text"
                >
                    <option value="APPLICATION">Supplier</option>
                    
                </select>
             </div>
           </div>
          
           <p />
         </form>
       </div>
       <div class="modal-footer">
         <button type="button" class="back-button" data-bs-dismiss="modal"
           >Close</button
         >
         <button
           type="button"
           class="my-button"
           data-bs-dismiss="modal"
           on:click={changeUserType(type)}>Apply</button
         >
       </div>
     </div>
   </div>
 </div>

 
{:else}
  <div class="alert" role="alert">
    <h3><b>Not logged in</b></h3>
  </div>
{/if}
