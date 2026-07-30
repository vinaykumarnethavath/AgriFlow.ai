from datetime import datetime
from typing import Optional, List
from enum import Enum
from sqlmodel import Field, SQLModel, Relationship

class ChannelType(str, Enum):
    P2P = "p2p"
    GROUP = "group"

class ChatChannel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # E.g. "Direct Chat" or "Anantapur Farmers Group"
    channel_type: ChannelType
    location_tag: Optional[str] = None  # State/district tag for auto-joining local groups
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["ChatMessage"] = Relationship(back_populates="channel", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    members: List["ChannelMember"] = Relationship(back_populates="channel", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class ChannelMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    channel_id: int = Field(foreign_key="chatchannel.id", ondelete="CASCADE")
    user_id: int = Field(foreign_key="user.id", ondelete="CASCADE")
    joined_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    channel: ChatChannel = Relationship(back_populates="members")

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    channel_id: int = Field(foreign_key="chatchannel.id", ondelete="CASCADE")
    sender_id: int = Field(foreign_key="user.id", ondelete="CASCADE")
    sender_name: str
    message_text: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    channel: ChatChannel = Relationship(back_populates="messages")
