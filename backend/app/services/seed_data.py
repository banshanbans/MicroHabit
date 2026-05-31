from copy import deepcopy
from typing import Optional


VIDEOS = {
    "meditation": {
        "id": "video_meditation_001",
        "source": "demo",
        "scenario": "meditation",
        "title": "10 分钟提升专注力，放下焦虑的 0 基础冥想",
        "coverUrl": "/seed-covers/meditation.jpg",
        "creatorName": "微光冥想室",
        "durationSec": 686,
        "rawDescription": "室内静坐冥想，包含呼吸和身体觉察引导，适合被拆成低门槛专注恢复路径。",
    },
    "stretch": {
        "id": "video_stretch_001",
        "source": "demo",
        "scenario": "stretch",
        "title": "拉伸跟练：扣膝转体、背部拉伸和侧向拉伸",
        "coverUrl": "/seed-covers/stretch.jpg",
        "creatorName": "大璐拉伸",
        "durationSec": 418,
        "rawDescription": "跟练式全身拉伸，关键动作包含扣膝转体、伏地背部拉伸、侧向拉伸加转体。",
    },
    "eye_yoga": {
        "id": "video_eye_yoga_001",
        "source": "demo",
        "scenario": "eye_yoga",
        "title": "每天 2 分钟眼部瑜伽，眼周放松跟练",
        "coverUrl": "/seed-covers/eye-yoga.jpg",
        "creatorName": "眼周放松练习",
        "durationSec": 158,
        "rawDescription": "带计时的眼部瑜伽跟练，包含眉眼周围按压和放松动作，适合屏幕后做一次轻恢复。",
    },
}


ANALYSES = {
    "meditation": {
        "id": "analysis_meditation_001",
        "videoId": "video_meditation_001",
        "scenario": "meditation",
        "theme": "专注恢复与情绪放松",
        "summary": "这条 10 分钟左右的静坐冥想包含呼吸和身体觉察引导，适合拆成每天 1-3 分钟的专注恢复微行动。",
        "coreMicroAction": {"title": "每天做 1-3 分钟呼吸觉察", "description": "用稳定坐姿观察呼吸和身体感受，让注意力从杂念里轻轻回来。", "estimatedMinutes": 3},
        "whyWorthDoing": "它能给焦虑、浮躁或注意力分散的时刻留出一个缓冲，但目标不是立刻“变好”，而是练习温柔地回到当下。",
        "actionTips": ["坐姿舒适即可，不追求完全放空", "把注意力放在呼吸、身体或环境声音上", "走神时只需要发现，然后轻轻回来"],
        "useCases": ["上午开始学习前", "午饭后重新进入专注前", "睡前脑子停不下来时"],
        "precautions": ["适合日常放松和专注训练", "不替代心理咨询、医疗诊断或焦虑治疗", "如果练习中明显不适，可以睁眼并停止"],
        "risk": {"level": "medium", "label": "中风险提示", "message": "该内容适合日常放松，不作为焦虑或心理问题的治疗方案。", "reasons": ["涉及焦虑和情绪状态", "不能承诺治疗效果", "需要保留专业求助边界"], "allowedToGenerateChallenge": True, "saferAlternative": "先做 3 次自然呼吸，不要求完成完整冥想。"},
        "graphId": "graph_meditation_001",
        "recommendedDuration": 7,
    },
    "stretch": {
        "id": "analysis_stretch_001",
        "videoId": "video_stretch_001",
        "scenario": "stretch",
        "theme": "久坐后的身体舒展",
        "summary": "这条拉伸跟练包含扣膝转体、伏地背部拉伸、侧向拉伸加转体等动作，适合转成低强度身体松弛路径。",
        "coreMicroAction": {"title": "每天做 2 分钟低门槛拉伸", "description": "从小幅度转体、背部伸展或侧向拉伸里选一个动作，让身体从久坐姿势里松开。", "estimatedMinutes": 2},
        "whyWorthDoing": "拉伸可以作为久坐后的身体提醒，帮助你从固定姿势里切换出来，建立“坐久了就轻轻动一下”的习惯。",
        "actionTips": ["动作幅度要小，不追求拉到最深", "保持自然呼吸，不憋气", "优先选择不需要场地的轻版本"],
        "useCases": ["午饭后回到工位", "下班后回家放松时", "连续坐着超过 45 分钟后"],
        "precautions": ["如果出现疼痛、眩晕或明显不适，请停止", "急性损伤或明确疾病人群应先咨询专业人士", "该内容不替代医疗康复训练"],
        "risk": {"level": "low", "label": "低风险", "message": "适合日常低强度活动，但需要保持小幅度并随时停止。", "reasons": ["动作可缩小", "不涉及治疗承诺", "可以按身体反馈调整"], "allowedToGenerateChallenge": True},
        "graphId": "graph_stretch_001",
        "recommendedDuration": 7,
    },
    "eye_yoga": {
        "id": "analysis_eye_yoga_001",
        "videoId": "video_eye_yoga_001",
        "scenario": "eye_yoga",
        "theme": "屏幕后眼周放松",
        "summary": "这条 2 分多钟的眼部瑜伽是带计时的跟练，包含眼周按压和眉眼放松；更适合转译为护眼休息，而不是外貌改变承诺。",
        "coreMicroAction": {"title": "每天做 1 分钟眼周放松", "description": "暂停看屏幕，远眺、眨眼，再用轻柔手法放松眼周。", "estimatedMinutes": 1},
        "whyWorthDoing": "它能给长时间近距离用眼一个温柔切换，帮助眼周从紧绷里放松下来，让眼神状态更舒展。",
        "actionTips": ["手法保持轻，不按压眼球", "先洗手，避开眼部炎症或不适时段", "搭配远眺和自然眨眼会更轻松"],
        "useCases": ["连续看屏幕后", "下午眼睛干涩时", "睡前放下手机后"],
        "precautions": ["不承诺变大眼、双眼皮或外貌改变", "如有眼痛、视力变化或炎症，应停止并寻求专业帮助", "隐形眼镜不适时先摘下或暂停"],
        "risk": {"level": "medium", "label": "中风险提示", "message": "眼周动作只适合作为日常放松，不替代眼科建议，也不承诺外貌改变。", "reasons": ["涉及眼部区域", "原视频含外貌效果表达", "需要避免按压眼球和治疗承诺"], "allowedToGenerateChallenge": True, "saferAlternative": "先做 20 秒远眺和 5 次自然眨眼。"},
        "graphId": "graph_eye_yoga_001",
        "recommendedDuration": 7,
    },
}


def _node(node_id, node_type, title, description, x, y, linked_day=None, status=None):
    if status is None:
        status = "locked" if linked_day and linked_day > 2 else "active" if linked_day == 2 else "completed"
    return {"id": node_id, "type": node_type, "title": title, "description": description, "status": status, "position": {"x": x, "y": y}, "linkedDay": linked_day}


GRAPHS = {
    "meditation": {
        "id": "graph_meditation_001",
        "videoId": "video_meditation_001",
        "title": "专注微冥想",
        "description": "从观察思绪开始，逐步点亮呼吸、身体觉察和专注重启节点。",
        "nodes": [
            _node("node_meditation_topic", "topic", "专注微冥想", "把 10 分钟冥想拆成每天可完成的短练习。", 50, 50, status="active"),
            _node("node_thought_observe", "knowledge", "思绪观察", "先发现脑中正在出现的念头，不急着赶走。", 26, 20, 1),
            _node("node_breath_anchor", "action", "呼吸节奏", "观察 3 次自然吸气和呼气。", 70, 20, 2),
            _node("node_attention_anchor", "action", "注意力锚点", "把注意力轻轻放回身体或环境声音。", 78, 45, 3),
            _node("node_body_awareness", "action", "身体扫描", "从肩膀到腹部感受身体经过呼吸。", 72, 70, 4),
            _node("node_focus_restart", "action", "午后专注重启", "用 1 分钟冥想重新进入学习或工作。", 50, 82, 5),
            _node("node_bedtime_meditation", "action", "睡前放松", "睡前只保留 3 次自然呼吸。", 22, 70, 6),
            _node("node_meditation_review", "reflection", "冥想复盘", "记录最容易安静下来的场景。", 50, 16, 7, "locked"),
        ],
    },
    "stretch": {
        "id": "graph_stretch_001",
        "videoId": "video_stretch_001",
        "title": "身体松弛拉伸",
        "description": "从久坐风险开始，点亮转体、背部、侧向拉伸和呼吸收尾。",
        "nodes": [
            _node("node_stretch_topic", "topic", "身体松弛拉伸", "把拉伸跟练拆成低压、短时、可复用的微行动。", 50, 50, status="active"),
            _node("node_sedentary_risk", "knowledge", "久坐风险", "认识长时间固定姿势带来的紧绷。", 26, 20, 1),
            _node("node_knee_twist", "action", "扣膝转体", "用小幅度转体让腰背从久坐里松开。", 70, 20, 2),
            _node("node_back_stretch", "action", "背部拉伸", "选择一个伏地或坐姿背部伸展。", 78, 45, 3),
            _node("node_side_stretch", "action", "侧向拉伸", "轻轻拉开身体侧面，不追求极限。", 72, 70, 4),
            _node("node_shoulder_release", "action", "肩背放松", "让肩膀和上背部从屏幕姿势里回位。", 50, 82, 5),
            _node("node_breath_finish", "action", "呼吸收尾", "用 3 轮自然呼吸结束拉伸。", 22, 70, 6),
            _node("node_stretch_review", "reflection", "拉伸复盘", "找到最适合你的低门槛拉伸动作。", 50, 16, 7, "locked"),
        ],
    },
    "eye_yoga": {
        "id": "graph_eye_yoga_001",
        "videoId": "video_eye_yoga_001",
        "title": "护眼微行动",
        "description": "从屏幕疲劳识别开始，点亮远眺、眨眼和眼周放松节点。",
        "nodes": [
            _node("node_eye_topic", "topic", "护眼微行动", "把眼部瑜伽转成屏幕后的一分钟恢复。", 50, 50, status="active"),
            _node("node_screen_fatigue", "knowledge", "屏幕疲劳识别", "发现眼干、眯眼或眉眼紧绷的信号。", 26, 20, 1),
            _node("node_far_gaze", "action", "远眺 20 秒", "看向远处，让眼睛从近距离屏幕切换出来。", 70, 20, 2),
            _node("node_blink_restore", "action", "眨眼恢复", "自然眨眼 5 次，提醒眼睛补一次湿润。", 78, 45, 3),
            _node("node_eye_area_relax", "action", "眼周放松", "轻柔放松眉眼周围，不按压眼球。", 72, 70, 4),
            _node("node_brow_release", "action", "眉眼舒展", "放松额头和眉心，让表情慢慢松开。", 50, 82, 5),
            _node("node_bedtime_eye_rest", "action", "睡前眼部休息", "放下手机后给眼睛一个安静收尾。", 22, 70, 6),
            _node("node_eye_review", "reflection", "护眼复盘", "记录哪一种休息最容易发生。", 50, 16, 7, "locked"),
        ],
    },
}

for graph in GRAPHS.values():
    graph["edges"] = [
        {
            "id": f"{graph['id']}_edge_{index}",
            "source": graph["nodes"][0]["id"] if index == 0 else graph["nodes"][index]["id"],
            "target": node["id"],
            "status": "completed" if index < 2 else "active" if index == 2 else "inactive",
        }
        for index, node in enumerate(graph["nodes"][1:])
    ]
    graph["progress"] = {"totalNodes": len(graph["nodes"]), "completedNodes": 2}


DAY_SETS = {
    "meditation": [
        ("思绪观察", "给当前状态一个词：紧、乱、困或平静。", "先看见状态，比立刻改变更温柔。", "node_thought_observe", 1),
        ("呼吸节奏", "观察 3 次自然吸气和呼气。", "把注意力放回一个稳定入口。", "node_breath_anchor", 1),
        ("注意力锚点", "把注意力放在身体接触地面的感觉 30 秒。", "锚点能帮你从杂念里轻轻回来。", "node_attention_anchor", 1),
        ("身体扫描", "从肩膀到腹部感受一次身体经过呼吸。", "身体觉察能降低练习门槛。", "node_body_awareness", 2),
        ("午后专注重启", "开始学习或工作前，做 1 分钟静坐。", "用短暂停顿给注意力重新开机。", "node_focus_restart", 1),
        ("睡前放松", "睡前只做 3 次自然呼吸。", "让一天有一个不费力的收尾。", "node_bedtime_meditation", 1),
        ("冥想复盘", "写下最容易安静下来的时间或地点。", "把适合你的场景留下来。", "node_meditation_review", 1),
    ],
    "stretch": [
        ("久坐风险", "观察今天连续坐着超过 45 分钟的时刻。", "先看见习惯，才容易温柔地调整。", "node_sedentary_risk", 1),
        ("扣膝转体", "坐姿或躺姿做一次小幅度转体。", "让腰背从固定方向里松开一点。", "node_knee_twist", 2),
        ("背部拉伸", "选择一个伏地或坐姿背部伸展，保持 20 秒。", "给背部一次慢慢展开的机会。", "node_back_stretch", 2),
        ("侧向拉伸", "身体向一侧轻轻延展，再换边。", "照顾平时很少被拉开的身体侧面。", "node_side_stretch", 2),
        ("肩背放松", "肩膀向后绕圈 8 次，再自然垂下。", "给上背部一次轻柔重启。", "node_shoulder_release", 2),
        ("呼吸收尾", "完成 3 轮自然呼吸，让动作慢慢结束。", "让拉伸不只是动作，也是一段放松。", "node_breath_finish", 1),
        ("拉伸复盘", "写下今天最舒服的一个动作。", "下一轮只保留最适合你的轻版本。", "node_stretch_review", 1),
    ],
    "eye_yoga": [
        ("屏幕疲劳识别", "观察眼睛是否干涩、眯眼或眉心紧。", "先发现眼睛累了，才更容易暂停。", "node_screen_fatigue", 1),
        ("远眺 20 秒", "看向 6 米外或窗外 20 秒。", "让眼睛从近距离屏幕里切换出来。", "node_far_gaze", 1),
        ("眨眼恢复", "自然眨眼 5 次，再闭眼休息 5 秒。", "给眼睛一次轻微湿润和暂停。", "node_blink_restore", 1),
        ("眼周放松", "用指腹轻柔放松眉眼周围，不碰眼球。", "让紧绷的眼周慢慢松开。", "node_eye_area_relax", 1),
        ("眉眼舒展", "放松额头和眉心，配合一次慢呼气。", "表情松一点，眼神也会更舒展。", "node_brow_release", 1),
        ("睡前眼部休息", "放下手机后闭眼 20 秒。", "给睡前的眼睛一个安静收尾。", "node_bedtime_eye_rest", 1),
        ("护眼复盘", "记录最容易暂停看屏幕的时刻。", "把护眼动作放进真实生活场景。", "node_eye_review", 1),
    ],
}


BADGES = {
    "meditation": "专注微光练习生",
    "stretch": "身体松弛练习生",
    "eye_yoga": "护眼观察员",
}


def scenario_from_text(value: Optional[str]) -> str:
    value = value or ""
    if "eye_yoga" in value or "eye-yoga" in value or "眼" in value or "护眼" in value:
        return "eye_yoga"
    if "meditation" in value or "冥想" in value or "专注" in value or "emotion" in value or "压力" in value or "情绪" in value:
        return "meditation"
    return "stretch"


def build_days(scenario: str, duration_days: int) -> list[dict]:
    how_to_map = {
        "meditation": ["找到舒服坐姿", "不追求放空", "走神时轻轻回来", "不舒服就睁眼停止"],
        "stretch": ["动作保持小幅度", "自然呼吸", "不要追求最大幅度", "疼痛或眩晕就停下"],
        "eye_yoga": ["先洗手", "不要按压眼球", "动作保持轻柔", "眼部不适时跳过"],
    }
    precautions_map = {
        "meditation": ["该内容适合日常放松，不替代心理咨询或医疗建议。"],
        "stretch": ["如果出现疼痛、眩晕或明显不适，请停止。"],
        "eye_yoga": ["如有眼痛、视力变化或炎症，请停止并寻求专业帮助。"],
    }
    base = [
        {
            "day": index + 1,
            "title": title,
            "microAction": micro_action,
            "why": why,
            "howTo": how_to_map[scenario],
            "precautions": precautions_map[scenario],
            "graphNodeId": node_id,
            "estimatedMinutes": minutes,
        }
        for index, (title, micro_action, why, node_id, minutes) in enumerate(DAY_SETS[scenario])
    ]
    if duration_days <= len(base):
        return deepcopy(base[:duration_days])
    extra = []
    for index in range(duration_days - len(base)):
        source = base[(index + 1) % (len(base) - 1)]
        day = len(base) + index + 1
        item = deepcopy(source)
        item.update({"day": day, "title": f"巩固练习 {day}", "microAction": f"复习「{source['title']}」，只做一个最轻版本。", "why": "延长周期的重点不是加压，而是让动作更稳定地出现在生活里。"})
        extra.append(item)
    return deepcopy(base + extra)
