package ch.zhaw.powerpuff.powerpuff.model.status;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class EmailValidationDTO {

    public String status;
    public String email_address;
    public String domain;
    public boolean deliverable;
    
}
