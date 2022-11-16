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
    private UserStatus userStatus;
    
    @NonNull
    private String eMail;
    
    @NonNull
    private String username;
    
    @NonNull
    private String name;
    
    @NonNull
    private String password;
}
