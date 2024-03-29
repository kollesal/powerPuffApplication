package ch.zhaw.powerpuff.powerpuff.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.mongodb.lang.NonNull;

import ch.zhaw.powerpuff.powerpuff.model.types.UserStatus;
import ch.zhaw.powerpuff.powerpuff.model.types.UserType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@NoArgsConstructor
@Document("user")
public class User {
    @Id
    private String id;

    @NonNull
    private UserStatus userStatus = UserStatus.ACTIVE;
    @NonNull
    private UserType userType = UserType.BUYER;
    @NonNull
    private String email;
    @NonNull
    private String username;
    @NonNull
    private String name;

    private String comment;

    public User(UserStatus userStatus, UserType userType, String email, String username, String name, String comment) {
        this.userStatus = userStatus;
        this.userType = userType;
        this.email = email;
        this.username = username;
        this.name = name;
        this.comment = comment;
    }

    
   
}


