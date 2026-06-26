package com.banquesysteme.banque_service_demandepret.servicepret;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.banquesysteme.banque_service_demandepret.dto.Pretdto;
import com.banquesysteme.banque_service_demandepret.model.DemandePret;
import com.banquesysteme.banque_service_demandepret.repository.DemandeRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Servicepret {

    private final DemandeRepository pretRepository ;

    @Transactional
    public DemandePret createDemandePret(Pretdto dto) {
        LocalDate dateActuelle = LocalDate.now();
        System.out.print("--tese client id "+ dto.getId_client1());
        System.out.print("--tese client id m "+ dto.getMontantDemande());
        System.out.print("--tese client id d "+ dto.getDuree());
    
    // Ajoute exactement 1 mois pour la prochaine échéance
        LocalDate prochaineEcheance = dateActuelle.plusMonths(1);
        String anneeString = String.valueOf(prochaineEcheance);

        float moantantAvecInteret = dto.getMontantDemande() + dto.getMontantDemande()*10/100;
        float montantEcheance = moantantAvecInteret / dto.getDuree();
        DemandePret demandePret = new DemandePret();
        demandePret.setIdClient(dto.getId_client1());
        demandePret.setMontantDemande(moantantAvecInteret);
        demandePret.setDateEcheance(anneeString);
        demandePret.setMontantEcheance(montantEcheance);
        
        return pretRepository.save(demandePret);
    }

    public DemandePret getpretValider(int id, String status) {
        DemandePret pDemandePret = pretRepository.findById(id).get();
        pDemandePret.setStatut("APPROUVE");
        return pretRepository.save(pDemandePret);
    }

    public DemandePret getpreRejetter(int id) {
        DemandePret pDemandePret = pretRepository.findById(id).get();
        pDemandePret.setStatut("REJETE");
        return pretRepository.save(pDemandePret);
    }
    public List<DemandePret> getAllDemandePrets() {
        return pretRepository.findAll();
    }

    @Transactional
    public void deletepret(int id) {
        if (!pretRepository.existsById(id)) {
           // throw new ExceptionManager("Country not found", HttpStatus.NOT_FOUND);
        }
        pretRepository.deleteById(id);
    }
}
