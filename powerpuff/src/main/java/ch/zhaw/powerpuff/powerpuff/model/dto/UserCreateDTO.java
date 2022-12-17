package ch.zhaw.powerpuff.powerpuff.model.dto;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UserCreateDTO {
    
    private String name;
    private String username;
    private String email;

    
   public UserCreateDTO(String name, String username, String email) {
      this.name = name;
      this.username = username;
      this.email = email;
   }


   public String getName() {
      return name;
   }


   public String getUsername() {
      return username;
   }


   public String getEmail() {
      return email;
   }

    

   public void setName(String name) {
      this.name = name;
   }


   public void setUsername(String username) {
      this.username = username;
   }


   public void setEmail(String email) {
      this.email = email;
   }

    
    
}
