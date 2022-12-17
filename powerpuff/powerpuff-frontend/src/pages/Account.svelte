<script>
      import axios from "axios";
    import { jwt_token } from "../store";
  import { isAuthenticated, user } from "../store";

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
            url: api_root + "/api/users/email/" + $user.email,
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
                  <hr>
                  <div class="row">
                    <div class="col-sm-3">
                      <h6 class="mb-0">Email</h6>
                    </div>
                    <div class="col-sm-9 text-secondary">
                        {$user.email}
                    </div>
                  </div>
                  <hr>
                  <div class="row">
                    <div class="col-sm-3">
                      <h6 class="mb-0">User Status</h6>
                    </div>
                    <div class="col-sm-9 text-secondary">
                      <p>{userper.userStatus}</p>  
                    </div>
                  </div>
                  <hr>
 <!-- Show roles only if user has at least one role -->
                  {#if $user.user_roles && $user.user_roles.length > 0} 
                  <div class="row">
                    <div class="col-sm-3">
                      <h6 class="mb-0">Roles: </h6>
                    </div>
                    <div class="col-sm-9 text-secondary">
                      <p>{$user.user_roles}</p> 
                    </div>
                  </div>
                  {/if}
                  <hr>
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

    {:else}

    <div class="alert" role="alert">
      <h3><b>Not logged in</b></h3>
    </div>
   
{/if}