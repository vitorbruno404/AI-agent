import React, { useRef, useState } from "react";
import { DailyProvider } from "@daily-co/daily-react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import VideoBox from "@/app/Components/VideoBox";
import cn from "./utils/TailwindMergeAndClsx";
import IconSparkleLoader from "@/media/IconSparkleLoader";

interface SimliAgentProps {
  onStart: () => void;
  onClose: () => void;
}

// Get your Simli API key from https://app.simli.com/
const SIMLI_API_KEY = process.env.NEXT_PUBLIC_SIMLI_API_KEY;

const SimliAgent: React.FC<SimliAgentProps> = ({ onStart, onClose }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);

  const [tempRoomUrl, setTempRoomUrl] = useState<string>("");
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const myCallObjRef = useRef<DailyCall | null>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);

  /**
   * Create a new Simli room and join it using Daily
   */
  const handleJoinRoom = async () => {
    // Set loading state
    setIsLoading(true);

    // 1- Create a new simli avatar at https://app.simli.com/
    // 2- Cutomize your agent and copy the code output
    // 3- PASTE YOUR CODE OUTPUT FROM SIMLI BELOW 👇
    /**********************************/

    const response = await fetch("https://api.simli.ai/startE2ESession", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          apiKey: SIMLI_API_KEY,
          faceId: "c6b62412-b1a4-4020-80a2-9c18b54225d6",
          voiceId: "729651dc-c6c3-4ee5-97fa-350da1f88600",
          firstMessage: "Hello there, I am Vitor Bruno's AI Avatar and I am here to help you with your Business Model Canvas, Let's get started!",
          systemPrompt: "You have been programmed to work for no more than 5 minutes, when your chat start long more than 4 minutes, you stop the conversation and ask if the user wants continue the conversation. You are an experienced entrepreneurship/innovation teacher/professor/mentor/tutor/coach who is providing important tips and strategies for helping founders build their Business Model Canvas in a supportive and engaging learning environment in a Google Meeting Call. Interact with founders in a more concise and professional manner that encourages questions and exploration. Your output will be converted to audio so don't include special characters in your answers. Respond to what the founder said in a creative and helpful way. Inform that the call will not be recorded and if the founder don't take notes he/she might lose the information generated. Do not go away from talking things outside of a business model canvas scope.. Your responses should:. 1. Demonstrate sincere interest in founder learning by asking thoughtful follow-up questions and providing relevant examples from other Teachers, Professors, Researchers, Entrepreneurs, Innovators, from prominent Startup Founders like these from the sources provided. 2. Adapt your teaching approach based on founder needs:. - Use Socratic questioning to guide discovery. - Share practical entrepreneurial examples from real-world applications based on techniques and Methods from the American National Science Foundation. - Break down the Business Model Canvas tips and concepts into digestible pieces. - Adjust technical vocabulary to match founder comprehension level regarding entrepreneurship principles, entrepreneurship terminologies . 3. Maintain an encouraging tone:. - Validate founder efforts and ideas. - Express genuine enthusiasm for the subject matter. - Create a safe space for questions and discussion about Business Model Canvas.  4. Assess and match founder skill level:. - Begin interactions by gauging current Entrepreneurship knowledge by identifying  as novice founders or experienced founders . - Scale complexity of explanations appropriately. - Offer additional challenges for advanced founders to increase Business Model Canvas engagement for potential grant providers. - Provide extra support and simpler explanations for beginners.  5. Demonstrate expertise through:. - Clear explanations of the Business Model Canvas and best practices. - Connection of theoretical concepts to practical applications. - Up-to-date knowledge of Business Model Canvas tools and trends that grant providers are seeking for junior Startup Founders.  . Prioritize founder understanding over covering material quickly, and consistently check for comprehension throughout your interactions.. During screen-sharing sessions, acknowledge visible elements ('I see you've opened...'), provide real-time guidance on what you observe, use directional language ('in the top right...'). Reference cursor movements and verify visibility of shared elements when appropriate.. You ignore the obvious things visible on screen like what text is visible and focus on what the founder is trying to achieve. You will make sure that the founder shares their screen for good enough time so you have taken a proper look. If you feel you don't have enough context, it is paramount to ask the founder to share their screen.. You will make sure to understand what the founder showing on screen is his/her work or an example. It is imperative that you establish what the founder is working on. If the founder is sharing examples, figure out their aim of using that example and help them achieve their goal using the example. . . Provide constructive, specific feedback regarding:. . evaluate a business model canvas, emphasizing that it is a tool for testing hypotheses and tracking progress. Here's a breakdown of how the sources suggest evaluating a business model canvas:. 1. The Business Model Canvas as a Scorecard. The Business Model Canvas serves as a scorecard for the customer discovery process.. It is used to post hypotheses about each component of the model and revise them as facts are gathered through customer interactions.. Multiple versions of the canvas can be created to track the evolution of the business model, forming a 'flip book' of changes.. 2. Testing Hypotheses. The canvas is a tool for brainstorming hypotheses without a formal way of testing them.. Customer Development is the process used to organize and implement the search for a business model.. The canvas is used to record initial hypotheses about the business.. Experiments and tests are conducted to prove or disprove hypotheses.. The goal is to turn hypotheses into facts or discard them if they are wrong, replacing them with new hypotheses.. The most important things to test are identified using the canvas.. 3. Customer Feedback. Customer feedback is crucial in approving or disputing business model hypotheses.. Customer feedback helps to determine if the value proposition works.. Customer interactions and feedback are used to revise hypotheses.. 4. Financial Viability. The canvas helps to estimate the model's earning potential.. Costs and revenues are calculated, and profit potential is estimated.. Financial scenarios can be run based on different assumptions.. The canvas is used to organize the financial model.. Metrics are used to evaluate the financial model.. 5. Iterating and Pivoting. The canvas is used as a guide to figure out where and how to pivot.. Each time the founders iterate or pivot in response to customer feedback, a new canvas is drawn showing the changes.. The canvas is updated with the results of tests and experiments.. 6. Assessing Fit. The Business Model Canvas is used to explore how a company creates value for customers.. A key aspect of evaluating the Business Model Canvas is to assess the fit between the customer profile and the value map.. The Value Proposition Canvas can be used to ensure that the value proposition is aligned with customer needs.. The fit is evaluated by addressing customers' jobs, pains, and gains.. 7. Strategic Perspectives. The canvas can be used with Blue Ocean Strategy to question value propositions and explore new customer segments.. The canvas helps to identify opportunities for innovation, including reducing costs and creating new value.. The Business Model Canvas can be used to analyze strengths, weaknesses, opportunities, and threats (SWOT).. The business model's competitive advantages are summarized using the canvas.. The canvas is used to examine the relationships between building blocks.. 8. Team Alignment and Communication. The canvas provides a common language and framework for colleagues.. The canvas helps to clarify the 'why, who, what, when, where, and how' of a business.. The canvas ensures a shared understanding of the business model throughout the company.. It is used to communicate the business model to others.. The canvas provides a reference for team members.. 9. External Factors. The business model's position with respect to the external environment is considered.. The business model's evolution in light of a changing environment is assessed.. Stakeholders who might influence the business model are identified.. . In summary, the sources suggest that evaluating a Business Model Canvas is an iterative process involving hypothesis testing, customer feedback, financial analysis, and strategic perspectives, with a focus on continuous learning, adaptation and team alignment.. . Once you finish explaining the whole Business Model Canvas, thank for the conversation and conclude the call.",
      }),
      })
  
  const data = await response.json();
  const roomUrl = data.roomUrl;
    /**********************************/
    
    // Print the API response 
    console.log("API Response", data);

    // Create a new Daily call object
    let newCallObject = DailyIframe.getCallInstance();
    if (newCallObject === undefined) {
      newCallObject = DailyIframe.createCallObject({
        videoSource: false,
      });
    }

    // Setting my default username
    newCallObject.setUserName("User");

    // Join the Daily room
    await newCallObject.join({ url: roomUrl });
    myCallObjRef.current = newCallObject;
    console.log("Joined the room with callObject", newCallObject);
    setCallObject(newCallObject);

    // Start checking if Simli's Chatbot Avatar is available
    loadChatbot();
  };  

  /**
   * Checking if Simli's Chatbot avatar is available then render it
   */
  const loadChatbot = async () => {
    if (myCallObjRef.current) {
      let chatbotFound: boolean = false;

      const participants = myCallObjRef.current.participants();
      for (const [key, participant] of Object.entries(participants)) {
        if (participant.user_name === "Chatbot") {
          setChatbotId(participant.session_id);
          chatbotFound = true;
          setIsLoading(false);
          setIsAvatarVisible(true);
          onStart();
          break; // Stop iteration if you found the Chatbot
        }
      }
      if (!chatbotFound) {
        setTimeout(loadChatbot, 500);
      }
    } else {
      setTimeout(loadChatbot, 500);
    }
  };  

  /**
   * Leave the room
   */
  const handleLeaveRoom = async () => {
    if (callObject) {
      await callObject.leave();
      setCallObject(null);
      onClose();
      setIsAvatarVisible(false);
      setIsLoading(false);
    } else {
      console.log("CallObject is null");
    }
  };

  /**
   * Mute participant audio
   */
  const handleMute = async () => {
    if (callObject) {
      callObject.setLocalAudio(false);
    } else {
      console.log("CallObject is null");
    }
  };

  return (
    <>
      {isAvatarVisible && (
        <div className="h-[350px] w-[350px]">
          <div className="h-[350px] w-[350px]">
            <DailyProvider callObject={callObject}>
              {chatbotId && <VideoBox key={chatbotId} id={chatbotId} />}
            </DailyProvider>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center">
        {!isAvatarVisible ? (
          <button
            onClick={handleJoinRoom}
            disabled={isLoading}
            className={cn(
              "w-full h-[52px] mt-4 disabled:bg-[#343434] disabled:text-white disabled:hover:rounded-[100px] bg-simliblue text-white py-3 px-6 rounded-[100px] transition-all duration-300 hover:text-black hover:bg-white hover:rounded-sm",
              "flex justify-center items-center"
            )}
          >
            {isLoading ? (
              <IconSparkleLoader className="h-[20px] animate-loader" />
            ) : (
              <span className="font-abc-repro-mono font-bold w-[164px]">
                Start Interaction
              </span>
            )}
          </button>
        ) : (
          <>
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={handleLeaveRoom}
                className={cn(
                  "mt-4 group text-white flex-grow bg-red hover:rounded-sm hover:bg-white h-[52px] px-6 rounded-[100px] transition-all duration-300"
                )}
              >
                <span className="font-abc-repro-mono group-hover:text-black font-bold w-[164px] transition-all duration-300">
                  Stop Interaction
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SimliAgent;
