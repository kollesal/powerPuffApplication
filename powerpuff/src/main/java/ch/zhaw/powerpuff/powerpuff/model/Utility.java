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
@Document("utility")
public class Utility {
    @Id
    private String id;

    @NonNull
    private String utilityName;

    @NonNull
    private int unit;

    private UtilityType utilityType = UtilityType.NEEDLE;    
    
}
