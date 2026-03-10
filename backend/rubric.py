# Evaluation Rubric for Interview Assessments
# This rubric defines consistent scoring criteria across all interviews (Technical & HR)

EVALUATION_RUBRIC = {
    "title": "Interview Answer Evaluation Rubric",
    "description": "Detailed scoring guidelines for evaluating interview answers - applies to both Technical and HR interviews",
    "interview_types_supported": ["Technical", "HR"],
    "score_ranges": [
        {
            "range": "0-1",
            "label": "No Understanding / No Effort",
            "description": "Answer shows complete lack of understanding or effort to answer",
            "examples": [
                "I don't know",
                "Not sure about that",
                "Never heard of it",
                "No answer provided",
                "Completely irrelevant response"
            ],
            "characteristics": [
                "Admission of complete lack of knowledge",
                "Zero attempt to answer the question",
                "Completely off-topic or nonsensical",
                "Silent or minimal response",
                "Refusal to engage with question"
            ],
            "applies_to": ["Technical", "HR"]
        },
        {
            "range": "2-3",
            "label": "Poor / Minimal Effort",
            "description": "Answer attempts to address the topic but shows very limited understanding or depth",
            "examples_technical": [
                "Something about JavaScript I think",
                "It's related to strings maybe",
                "I heard of databases once"
            ],
            "examples_hr": [
                "I'm a good worker",
                "I like working with people",
                "I'm reliable I guess"
            ],
            "characteristics": [
                "Extremely vague statements",
                "Incorrect or misleading information",
                "Barely addresses the question",
                "Shows minimal effort or research",
                "Incomplete sentences or poor communication"
            ],
            "applies_to": ["Technical", "HR"]
        },
        {
            "range": "4-5",
            "label": "Partial / Incomplete",
            "description": "Answer partially addresses the question with basic understanding but lacks specificity",
            "examples_technical": [
                "A palindrome reads the same forwards and backwards, I think",
                "You validate it by checking characters somehow",
                "In JavaScript you can use a loop"
            ],
            "examples_hr": [
                "I once had a conflict with a coworker and we worked it out",
                "I'm good at teamwork because I like to collaborate",
                "My strength is that I learn quickly"
            ],
            "characteristics": [
                "Some correct concepts but incomplete",
                "Lacks specific details, examples, or evidence",
                "Missing important context or edge cases",
                "Surface-level explanation only",
                "No concrete stories or code examples"
            ],
            "applies_to": ["Technical", "HR"]
        },
        {
            "range": "6-7",
            "label": "Good / Competent",
            "description": "Answer correctly addresses the question with specific details and relevant examples",
            "examples_technical": [
                "A palindrome reads the same forwards and backwards. You check by comparing first and last character, then move inward toward the center.",
                "You'd normalize the string first - remove spaces and special characters, convert to lowercase",
                "In JavaScript, reverse the string and compare with the original using a simple equals check"
            ],
            "examples_hr": [
                "I once had a conflict with a team member about project priorities. I listened to their perspective, explained mine, and we found a compromise that satisfied both needs.",
                "My strength is communication - I regularly present ideas clearly and listen actively to feedback from my team members.",
                "Tell me about a time you failed: I missed a deadline because I underestimated complexity. I learned to break tasks into smaller chunks and flag risks early."
            ],
            "characteristics": [
                "Correct understanding clearly demonstrated",
                "Specific technical details or behavioral examples included",
                "Addresses key aspects of the question",
                "Clear explanation with reasoning provided",
                "Mentions relevant approach or methodology",
                "Uses STAR method (Situation-Task-Action-Result) for HR"
            ],
            "applies_to": ["Technical", "HR"]
        },
        {
            "range": "8-9",
            "label": "Excellent / Advanced",
            "description": "Answer is comprehensive with strong depth and insight, multiple perspectives considered",
            "examples_technical": [
                "A palindrome reads the same forwards/backwards. Normalize by removing non-alphanumeric, lowercase. Use two-pointer approach starting from both ends, comparing chars and moving inward. Time O(n), Space O(1). Handle null with early return, empty returns true.",
                "Multiple approaches: two-pointer for optimal space, reverse-and-compare for clarity. Discuss trade-offs between readability and performance. Handle Unicode carefully."
            ],
            "examples_hr": [
                "STAR example with deep reflection: 'During project X, I disagreed with the approach. I prepared data, requested a meeting, listened extensively first, then presented alternatives. We chose a hybrid approach. I learned the importance of timing and stakeholder alignment. Now I proactively seek input early.'",
                "Demonstrates growth mindset, specific metrics, systemic thinking about team dynamics, and clear learning outcomes"
            ],
            "characteristics": [
                "Comprehensive, well-structured answer",
                "Multiple approaches or considerations presented",
                "Specific implementation or behavioral details",
                "Discusses complexity, trade-offs, or deeper implications",
                "Explicitly addresses edge cases or nuances (for technical)",
                "Shows clear learning and reflection (for HR)",
                "Excellent communication and presentation"
            ],
            "applies_to": ["Technical", "HR"]
        },
        {
            "range": "10",
            "label": "Perfect / Exceptional",
            "description": "Answer is exceptional with outstanding insight, completeness, and professionalism",
            "examples": [
                "Complete solution with: working code, edge case handling, unit tests, performance explanation, comparison with alternatives, best practices discussion, and elegant implementation",
                "Outstanding HR response with: compelling STAR stories, clear personal growth trajectory, demonstrated learning from mistakes, strong alignment with company values, confident communication"
            ],
            "characteristics": [
                "Exceptional insight and creative thinking",
                "Complete, production-ready solution (for technical)",
                "Compelling, authentic storytelling (for HR)",
                "Discusses best practices and patterns",
                "Goes beyond requirements - shows initiative",
                "Excellent communication and professional demeanor",
                "Demonstrates leadership or mentoring mindset"
            ],
            "applies_to": ["Technical", "HR"]
        }
    ],
    "critical_rules": [
        "'I don't know' = 1/10 ALWAYS (NEVER higher due to partial credit)",
        "Vague statements = 2-3/10 maximum (mentioning topic alone is not enough)",
        "Grammar/incomplete sentences = penalty of 1-2 points",
        "Stuttering or speech issues = -1 point per significant occurrence",
        "Score based on ACTUAL content quality, not tone or confidence",
        "Be STRICT - average interview should score 4-6, not 7-8",
        "Only give 7+ scores for genuinely impressive answers with specific details",
        "For HR: Use STAR method expectations (Situation, Task, Action, Result)",
        "For HR: Look for evidence of self-awareness, growth, and learning",
        "For Technical: Look for correctness, efficiency, and edge case handling"
    ],
    "recommendation_mapping": {
        "hire": {
            "range": "8-10",
            "criteria": "Overall score 8 or above. Candidate demonstrates strong capabilities and answer quality across the board.",
            "meaning": "Candidate is well-qualified and ready to move forward in the process"
        },
        "consider": {
            "range": "5-7",
            "criteria": "Overall score between 5-7. Candidate shows decent understanding/fit with some gaps. Potential exists but needs further assessment.",
            "meaning": "Candidate shows promise but may need further evaluation or training"
        },
        "needs_improvement": {
            "range": "0-4",
            "criteria": "Overall score below 5. Candidate struggled with most questions and shows limited understanding/fit.",
            "meaning": "Candidate needs more preparation or experience before this role is suitable"
        }
    }
}

def get_rubric():
    """Return the complete evaluation rubric"""
    return EVALUATION_RUBRIC

def get_score_description(score):
    """Get the description for a given score"""
    score_int = int(score)
    for range_info in EVALUATION_RUBRIC["score_ranges"]:
        range_parts = range_info["range"].split("-")
        if len(range_parts) == 2:
            min_score, max_score = int(range_parts[0]), int(range_parts[1])
            if min_score <= score_int <= max_score:
                return range_info
    return None

def get_recommendation(overall_score):
    """Get recommendation based on overall score"""
    overall_score = float(overall_score)
    if overall_score >= 8:
        return EVALUATION_RUBRIC["recommendation_mapping"]["hire"]
    elif 5 <= overall_score < 8:
        return EVALUATION_RUBRIC["recommendation_mapping"]["consider"]
    else:
        return EVALUATION_RUBRIC["recommendation_mapping"]["needs_improvement"]
