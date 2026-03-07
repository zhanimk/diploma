package com.judo.competition.repository;

import com.judo.competition.model.WeightCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeightCategoryRepository extends JpaRepository<WeightCategory, Long> {
}
