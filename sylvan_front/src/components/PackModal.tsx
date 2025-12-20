import React, { useState } from 'react';

interface PackModalProps {
  onClose: () => void;
}

const PackModal: React.FC<PackModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'choose' | 'opening' | 'reward'>('choose');
  const [reward, setReward] = useState<string>('');
  
  const openPack = () => {
    setStep('opening');
    
    setTimeout(() => {
      const rewards = [
        '50 $SYL + 🌵 Cactus Seed',
        '100 $SYL + 💧 Pure Water',
        '25 $SYL + 🪨 Rare Mineral',
        '500 $SYL + 💎 Ancient Relic',
        '10 $SYL + 🍂 Dry Leaves',
        '75 $SYL + 🍄 Glowing Mushroom'
      ];
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      setReward(randomReward);
      setStep('reward');
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
        padding: '30px', borderRadius: '20px', border: '1px solid #333',
        textAlign: 'center', color: 'white', maxWidth: '600px', width: '90%',
        boxShadow: '0 0 50px rgba(0, 255, 127, 0.15)'
      }}>
        
        {step === 'choose' && (
          <>
            <h2 style={{ color: '#ffd700', marginBottom: '20px' }}>
              🎁 SELECT YOUR REWARD
            </h2>
            <p style={{ marginBottom: '25px', color: '#888' }}>
              Choose a container to decrypt.
            </p>
            
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', justifyItems: 'center'
            }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} onClick={openPack} style={{
                  width: '100%', height: '100px', 
                  background: 'linear-gradient(to bottom, #333, #111)',
                  borderRadius: '10px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '35px',
                  border: '1px solid #444'
                }}>
                  📦
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'opening' && (
          <div style={{ padding: '40px' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>📦</div>
            <p style={{ color: '#00ff7f' }}>DECRYPTING...</p>
          </div>
        )}

        {step === 'reward' && (
          <div>
            <h2 style={{ color: '#00ff7f', marginBottom: '10px' }}>🎉 COMPLETE!</h2>
            <div style={{ 
              background: 'rgba(0, 255, 127, 0.05)', padding: '25px', 
              borderRadius: '15px', border: '1px solid #00ff7f', marginBottom: '30px',
              fontWeight: 'bold', fontSize: '1.3rem', color: '#fff'
            }}>
              {reward}
            </div>
            <button onClick={onClose} style={{
              padding: '12px 30px', background: '#ffd700', border: 'none',
              borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
            }}>
              Collect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackModal;