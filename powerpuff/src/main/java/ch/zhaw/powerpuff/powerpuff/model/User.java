package ch.zhaw.powerpuff.powerpuff.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.mongodb.lang.NonNull;

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
    //@NonNull
    //private String password;
}
