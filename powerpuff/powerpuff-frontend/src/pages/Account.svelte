<script>
  import { isAuthenticated, user } from "../store";
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
                      <p class="text-secondary mb-1">{$user.userType}</p>
                      <button class="my-button">Change Status</button>
                      <button class="my-button">Change User Type</button>
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
                      <p>{$user.userStatus}</p>  
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
                  <div class="row">
                    <div class="col-sm-12">
                      <button class="delete-button" target="__blank">Delete</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
    </div>

    {:else}

    <div class="alert" role="alert">
      <h3><b>Not logged in</b></h3>
    </div>
   
{/if}