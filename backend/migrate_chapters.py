"""
章节数据迁移脚本

将前端硬编码的章节数据导入到数据库

运行方式: python migrate_chapters.py
"""
import json

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.chapter import Chapter


# 前端硬编码的章节数据
CHAPTERS_DATA = [
    {
        "chapter_id": "supply-demand",
        "title": "供给与需求",
        "description": "理解市场经济最基础的两大力量",
        "content": """供给与需求是经济学的核心概念。供给是指卖家在各种价格水平下愿意出售的商品数量，需求则是买家在各种价格水平下愿意购买的数量。

当供给等于需求时，市场达到"均衡"，这个价格就是均衡价格。如果价格高于均衡，会出现供过于求；如果价格低于均衡，会出现供不应求。

供需关系的变化会影响价格：供给增加、需求不变时，价格下降；需求增加、供给不变时，价格上升。""",
        "simple_explanation": "想象你在跳蚤市场卖旧书。如果你的书很多人想要（需求大），你就可以定高价。如果很多人都在卖同样的书（供给大），你就得降价才能卖出去。这就是供需关系决定价格的基本原理。",
        "examples": [
            "疫情期间口罩需求激增，价格飙升 - 这是需求冲击的例子",
            "技术进步使芯片生产成本降低 - 这是供给增加的例子",
            "演唱会门票秒空 - 供不应求的经典案例"
        ],
        "category": "micro",
        "difficulty": "beginner",
        "order": 1,
        "related_charts": ["supply-demand-curve"]
    },
    {
        "chapter_id": "price-mechanism",
        "title": "价格形成机制",
        "description": "价格是如何被决定的？",
        "content": """价格是市场经济的信号系统。当某种商品稀缺时，价格上涨，告诉生产者"多生产这个"，告诉消费者"少买点这个"。

价格机制通过三个步骤调节市场：
1. 价格信号：价格变化传递信息
2. 激励机制：高价激励生产，低价激励消费
3. 资源配置：资源从低价值用途流向高价值用途""",
        "simple_explanation": "价格就像一个自动调节器。当东西少的时候涨价，让大家省着用；当东西多的时候降价，鼓励大家多买。整个过程不需要任何人指挥，完全自然进行。",
        "examples": [
            "油价上涨时，人们减少开车，电动车销量增加",
            "餐厅排队时，可能提价或扩大规模",
            "淡季机票便宜，旺季机票昂贵"
        ],
        "category": "micro",
        "difficulty": "beginner",
        "order": 2,
        "related_charts": ["price-equilibrium"]
    },
    {
        "chapter_id": "inflation",
        "title": "通货膨胀与通货紧缩",
        "description": "钱为什么会变不值钱？",
        "content": """通货膨胀是指整体物价水平持续上涨，货币购买力下降。通货紧缩则相反，物价普遍下跌。

适度通胀（约2%）被认为是健康的，但高通胀会侵蚀储蓄价值。通货紧缩看似对消费者有利，但可能导致经济衰退。

央行通过调整利率控制通胀：经济过热时加息，经济疲软时降息。""",
        "simple_explanation": "通胀就是你发现100元去年能买一购物车东西，今年只能买半车。不是因为东西变好了，而是钱变薄了。就像往汤里兑水，汤多了但味道淡了。",
        "examples": [
            "80年代一杯奶茶几毛钱，现在要十几二十块",
            "德国1923年恶性通胀：面包价格从几马克涨到几千亿马克",
            "日本90年代通货紧缩：物价和工资长期停滞"
        ],
        "category": "macro",
        "difficulty": "beginner",
        "order": 3,
        "related_charts": ["inflation-chart"]
    },
    {
        "chapter_id": "money-central-bank",
        "title": "货币与央行",
        "description": "谁在控制我们手中的钱？",
        "content": """货币是经济活动的血液。现代货币体系由中央银行管理，央行有三大职能：
1. 发行货币
2. 最后贷款人（危机时向银行提供流动性）
3. 货币政策（通过利率调节经济）

央行调整利率影响整个经济：利率降低刺激借贷和投资，利率升高抑制过热。""",
        "simple_explanation": "央行就像经济的水龙头控制器。经济太热就关水（加息），经济太冷就放水（降息）。但这个水龙头不能随便乱开，不然会导致通货膨胀。",
        "examples": [
            "美联储加息导致全球资金流向美国",
            "2008年金融危机时央行向市场注入大量流动性",
            "量化宽松（QE）= 央行直接买债券印钱"
        ],
        "category": "macro",
        "difficulty": "intermediate",
        "order": 4,
        "related_charts": ["money-supply"]
    },
    {
        "chapter_id": "market-failure",
        "title": "市场失灵",
        "description": "市场不是万能的",
        "content": """市场失灵指市场机制无法有效配置资源的情况，主要包括：
1. 外部性：如污染，企业成本<社会成本
2. 公共品：如国防、道路，私人无法有效提供
3. 信息不对称：买方卖方信息不平等
4. 垄断：单一企业控制市场

市场失灵时需要政府干预：税收、补贴、监管、直接提供公共品。""",
        "simple_explanation": "市场通常很聪明，但有时也会犯傻。比如工厂排污赚钱，但环境恶化大家遭殃 - 工厂不会考虑这个成本，这时候就需要政府管。",
        "examples": [
            "雾霾问题：企业不愿为环保付费，需政府监管",
            "疫苗：即使不想打的人也受益于群体免疫（正外部性）",
            "微软反垄断案：防止大公司滥用市场地位"
        ],
        "category": "micro",
        "difficulty": "intermediate",
        "order": 5,
        "related_charts": ["externalities"]
    }
]


def migrate_chapters(db: Session) -> None:
    """迁移章节数据"""
    for data in CHAPTERS_DATA:
        # 检查是否已存在
        existing = db.query(Chapter).filter(Chapter.chapter_id == data["chapter_id"]).first()

        if existing:
            print(f"⊙ 跳过已存在的章节: {data['title']}")
            continue

        chapter = Chapter(
            chapter_id=data["chapter_id"],
            title=data["title"],
            description=data["description"],
            content=data["content"],
            simple_explanation=data["simple_explanation"],
            examples=json.dumps(data["examples"]),
            category=data["category"],
            difficulty=data["difficulty"],
            order=data["order"],
            related_charts=json.dumps(data.get("related_charts", [])),
            is_published=True
        )

        db.add(chapter)
        print(f"✓ 导入章节: {data['title']}")

    db.commit()
    print("\n章节数据迁移完成！")


def main():
    """主函数"""
    print("=" * 50)
    print("EconoLearn 章节数据迁移")
    print("=" * 50)

    db = SessionLocal()
    try:
        migrate_chapters(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
