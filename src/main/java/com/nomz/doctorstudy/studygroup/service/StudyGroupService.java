package com.nomz.doctorstudy.studygroup.service;
import com.nomz.doctorstudy.studygroup.entity.MemberStudyGroup;
import com.nomz.doctorstudy.studygroup.entity.MemberStudyGroupApply;
import com.nomz.doctorstudy.studygroup.entity.StudyGroup;
import com.nomz.doctorstudy.studygroup.request.*;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface StudyGroupService {
    // 스터디 그룹 생성
    StudyGroup createStudyGroup(CreateStudyGroupRequest request, Authentication authentication);

    // 스터디 그룹 ID로 조회
    StudyGroup getStudyGroup(Long groupId);

    // 스터디 그룹 조건 검색
    List<StudyGroup> getStudyGroupList(GetStudyGroupListRequest command);

    // 스터디 그룹 지원 요청 생성
    MemberStudyGroupApply createApply(CreateApplyRequest createApplyRequest, Authentication authentication);

    // 스터디 그룹 지원 요청 조회
    MemberStudyGroupApply getApply(Long userId, Long groupId);

    // 스터디 그룹 지원 응답 처리 + 멤버-스터디그룹 테이블 저장
    MemberStudyGroupApply processReply(CreateReplyRequest createReplyRequest);

    // 스터디 그룹 업데이트
    StudyGroup updateStudyGroup(Long groupId, UpdateStudyGroupRequest request);

    //스터디 그룹 아이디로 속한 멤버 리스트 찾기
    List<MemberStudyGroup> getMemberListByStudyGroupId(Long studyGroupId);

    //스터디 그룹장이 속한 스터디 그룹의 대기자 리스트 찾기
    List<MemberStudyGroupApply> getWaiterList(Authentication authentication);

    // ID로 Study group 탈퇴 (소프트 탈퇴)
    StudyGroup deleteStudyGroup(Long groupId);

    // Respond to a study group application
    // void respondToStudyGroupApplication(AdmissionResponseRequest admissionResponseRequest);

    // Retrieve all study group applications
    // List<AdmissionResponse> getAllStudyGroupApplications();
}
