package ch.zhaw.powerpuff.powerpuff.model.dto;

import lombok.Setter;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
public class ProductActivateDTO {
    
    @NonNull
    private String productId;
}
