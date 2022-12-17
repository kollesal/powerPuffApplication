package ch.zhaw.powerpuff.powerpuff.model.dto;
import ch.zhaw.powerpuff.powerpuff.model.types.UtilityType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class UtilityUpdateDTO {
    private String utilityName;
    private int unit;
    private UtilityType utilityType;
    
}
