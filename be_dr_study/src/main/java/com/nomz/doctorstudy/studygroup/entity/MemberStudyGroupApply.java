package com.nomz.doctorstudy.studygroup.entity;

import com.nomz.doctorstudy.studygroup.ApplicationStatus;
import com.nomz.doctorstudy.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class MemberStudyGroupApply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="applicant_id", nullable = false)
    private Member applicant;

    @ManyToOne
    @JoinColumn(name = "study_group_id", nullable = false)
    private StudyGroup studyGroup;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplicationStatus applicationStatus; // e.g., "APPROVED", "DENIED", "WAITING"

    @Column(name = "created_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Column(name = "apply_message", length = 256)
    private String applyMessage;

    @Column(name = "reply_message", length = 256)
    private String replyMessage;
}
