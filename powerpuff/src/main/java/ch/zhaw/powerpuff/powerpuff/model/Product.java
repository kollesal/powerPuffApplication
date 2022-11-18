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
@Document("products")
public class Product {
    @Id
    private String id;

    @NonNull
    private DifficultyType difficultyType;
    @NonNull
    private ProductState productState;
    @NonNull
    private ProductType productType;
    @NonNull
    private String productName;
    @NonNull
    private String description;
    @NonNull
    private String size;
    @NonNull
    private String clothingType;
    @NonNull
    private double prize;
    @NonNull
    private String patchArt;

}
