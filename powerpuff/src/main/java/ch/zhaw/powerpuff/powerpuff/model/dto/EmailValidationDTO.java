package ch.zhaw.powerpuff.powerpuff.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EmailValidationDTO {

    private String status;
    private String email_address;
    private String domain;
    private boolean deliverable;
    
}
