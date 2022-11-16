package ch.zhaw.powerpuff.powerpuff.model;

import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter

@NoArgsConstructor
@Document("product")
@TypeAlias("schnittmuster")
public class Schnittmuster extends Product {
    private String size;
    private String clothingType;
    private double prize;

    
}
